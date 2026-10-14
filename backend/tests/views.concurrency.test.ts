import mongoose, { Types } from "mongoose";
import { Campaign } from "../src/models/Campaign";
import { Submission } from "../src/models/Submission";
import { updateSubmissionViews } from "../src/services/views.service";
import type { MilestoneStep } from "../src/types";
import { AppError } from "../src/utils/AppError";

/**
 * Real-database concurrency test. It only runs when MONGO_URI_TEST is set (in backend/.env or the shell),
 * and refuses to run unless the database name contains "test". It only deletes documents it created.
 */
const TEST_URI = process.env.MONGO_URI_TEST;
const describeDb = TEST_URI ? describe : describe.skip;

describeDb("views updates under real concurrency (MongoDB)", () => {
  jest.setTimeout(90_000);
  const campaignIds: Types.ObjectId[] = [];

  beforeAll(async () => {
    await mongoose.connect(TEST_URI as string, { serverSelectionTimeoutMS: 15_000 });
    if (!/test/i.test(mongoose.connection.name)) {
      const name = mongoose.connection.name;
      await mongoose.disconnect();
      throw new Error(`Refusing to run against "${name}": MONGO_URI_TEST must point at a database whose name contains "test"`);
    }
    await Promise.all([Campaign.init(), Submission.init()]);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Submission.deleteMany({ campaign: { $in: campaignIds } });
      await Campaign.deleteMany({ _id: { $in: campaignIds } });
    }
    await mongoose.disconnect();
  });

  async function setup(totalBudget: number, ladder: MilestoneStep[], creators: number) {
    const campaign = await Campaign.create({
      brand: new Types.ObjectId(),
      name: "Concurrency test",
      platform: "instagram",
      totalBudget,
      ladder,
    });
    campaignIds.push(campaign._id);
    const submissions = await Promise.all(
      Array.from({ length: creators }, (_, i) =>
        Submission.create({
          campaign: campaign._id,
          creator: new Types.ObjectId(),
          postLink: `https://instagram.com/p/${campaign._id}-${i}`,
        }),
      ),
    );
    return { campaign, submissions };
  }

  async function snapshot(campaignId: Types.ObjectId) {
    const campaign = await Campaign.findById(campaignId);
    const submissions = await Submission.find({ campaign: campaignId });
    return {
      spent: campaign?.budgetSpent ?? -1,
      total: campaign?.totalBudget ?? -1,
      paid: submissions.reduce((sum, s) => sum + s.amountPaid, 0),
      amounts: submissions.map((s) => s.amountPaid).sort((a, b) => a - b),
    };
  }

  it("two creators racing for the last rupees never overspend", async () => {
    const { campaign, submissions } = await setup(1_000, [{ views: 1_000, payout: 800 }], 2);

    await Promise.all(submissions.map((s) => updateSubmissionViews(String(s._id), 1_000)));

    const after = await snapshot(campaign._id);
    expect(after.spent).toBe(1_000);
    expect(after.paid).toBe(1_000);
    expect(after.amounts).toEqual([200, 800]); // one full payout, one partial
  });

  it("ten identical parallel updates to one submission pay exactly once", async () => {
    const ladder = [
      { views: 1_000, payout: 500 },
      { views: 5_000, payout: 2_000 },
    ];
    const { campaign, submissions } = await setup(100_000, ladder, 1);
    const id = String(submissions[0]._id);

    const results = await Promise.allSettled(Array.from({ length: 10 }, () => updateSubmissionViews(id, 5_000)));

    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
    const after = await snapshot(campaign._id);
    expect(after.paid).toBe(2_000);
    expect(after.spent).toBe(2_000);
  });

  it("a stampede of repeated updates keeps spend within budget and consistent, then drains it exactly", async () => {
    const ladder = [
      { views: 1_000, payout: 500 },
      { views: 5_000, payout: 2_000 },
    ];
    const { campaign, submissions } = await setup(3_000, ladder, 15);
    const ids = submissions.map((s) => String(s._id));

    const results = await Promise.allSettled([...ids, ...ids].map((id) => updateSubmissionViews(id, 5_000)));

    // The only acceptable failure under heavy contention is an explicit, retryable 409.
    for (const r of results) {
      if (r.status === "rejected") {
        expect(r.reason).toBeInstanceOf(AppError);
        expect((r.reason as AppError).code).toBe("CONCURRENT_UPDATE");
      }
    }

    const mid = await snapshot(campaign._id);
    expect(mid.spent).toBeLessThanOrEqual(mid.total);
    expect(mid.paid).toBe(mid.spent);

    // Retry everyone one at a time: whatever was left is paid out, and nothing more.
    for (const id of ids) await updateSubmissionViews(id, 5_000);

    const end = await snapshot(campaign._id);
    expect(end.spent).toBe(3_000);
    expect(end.paid).toBe(3_000);
  });
});
