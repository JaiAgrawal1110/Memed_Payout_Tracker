import { Types } from "mongoose";
import { Campaign } from "../src/models/Campaign";
import { Submission } from "../src/models/Submission";
import { MAX_ATTEMPTS, budgetGuard, updateSubmissionViews } from "../src/services/views.service";
import { LADDER } from "./fixtures";

// The models are mocked so every branch of the reserve -> credit -> retry flow can be exercised without a database.
jest.mock("../src/models/Campaign", () => ({
  Campaign: { findById: jest.fn(), findOneAndUpdate: jest.fn(), updateOne: jest.fn() },
}));
jest.mock("../src/models/Submission", () => ({
  Submission: { findById: jest.fn(), findOneAndUpdate: jest.fn(), findByIdAndUpdate: jest.fn() },
}));

const campaignFindById = Campaign.findById as unknown as jest.Mock;
const campaignFindOneAndUpdate = Campaign.findOneAndUpdate as unknown as jest.Mock;
const campaignUpdateOne = Campaign.updateOne as unknown as jest.Mock;
const submissionFindById = Submission.findById as unknown as jest.Mock;
const submissionFindOneAndUpdate = Submission.findOneAndUpdate as unknown as jest.Mock;
const submissionFindByIdAndUpdate = Submission.findByIdAndUpdate as unknown as jest.Mock;

const SUB_ID = new Types.ObjectId();
const CAMP_ID = new Types.ObjectId();

const campaignDoc = (budgetSpent = 0) => ({ _id: CAMP_ID, totalBudget: 10_000, budgetSpent, ladder: LADDER });
const submissionDoc = (amountPaid = 0, views = 0) => ({ _id: SUB_ID, campaign: CAMP_ID, views, amountPaid });

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Math, "random").mockReturnValue(0); // no backoff delay
});
afterAll(() => jest.restoreAllMocks());

describe("updateSubmissionViews", () => {
  it("only records views when nothing is owed, without touching the budget", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValue(campaignDoc());
    submissionFindByIdAndUpdate.mockResolvedValue(submissionDoc(0, 5_000));

    const result = await updateSubmissionViews(SUB_ID.toString(), 5_000);

    expect(campaignFindOneAndUpdate).not.toHaveBeenCalled();
    expect(submissionFindByIdAndUpdate).toHaveBeenCalledWith(
      SUB_ID.toString(),
      { $set: { views: 5_000, lastViewsUpdatedAt: expect.any(Date) } },
      { new: true },
    );
    expect(result.payout.paidNow).toBe(0);
    expect(result.submission.views).toBe(5_000);
  });

  it("reserves budget with a guard, then credits the submission with an amountPaid guard", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValue(campaignDoc());
    campaignFindOneAndUpdate.mockResolvedValue(campaignDoc(2_000));
    submissionFindOneAndUpdate.mockResolvedValue(submissionDoc(2_000, 50_000));

    const result = await updateSubmissionViews(SUB_ID.toString(), 50_000);

    expect(campaignFindOneAndUpdate).toHaveBeenCalledWith(
      budgetGuard(CAMP_ID, 2_000),
      { $inc: { budgetSpent: 2_000 } },
      { new: true },
    );
    expect(submissionFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: SUB_ID, amountPaid: 0 },
      { $set: { views: 50_000, amountPaid: 2_000, lastViewsUpdatedAt: expect.any(Date) } },
      { new: true },
    );
    expect(result.payout.paidNow).toBe(2_000);
    expect(result.campaign.remainingBudget).toBe(8_000);
  });

  it("recomputes against fresh budget when the reservation loses a race", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValueOnce(campaignDoc(0)).mockResolvedValueOnce(campaignDoc(9_000));
    campaignFindOneAndUpdate.mockResolvedValueOnce(null).mockResolvedValueOnce(campaignDoc(10_000));
    submissionFindOneAndUpdate.mockResolvedValue(submissionDoc(1_000, 50_000));

    const result = await updateSubmissionViews(SUB_ID.toString(), 50_000);

    expect(campaignFindOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(campaignFindOneAndUpdate).toHaveBeenLastCalledWith(
      budgetGuard(CAMP_ID, 1_000), // only ₹1,000 was left on the second read
      { $inc: { budgetSpent: 1_000 } },
      { new: true },
    );
    expect(result.payout.paidNow).toBe(1_000);
    expect(result.payout.cappedByBudget).toBe(true);
  });

  it("hands the reservation back and never double-pays when another request paid first", async () => {
    submissionFindById.mockResolvedValueOnce(submissionDoc(0)).mockResolvedValueOnce(submissionDoc(2_000, 50_000));
    campaignFindById.mockResolvedValue(campaignDoc(2_000));
    campaignFindOneAndUpdate.mockResolvedValueOnce(campaignDoc(4_000));
    submissionFindOneAndUpdate.mockResolvedValueOnce(null); // credit guard misses: someone else got there first
    submissionFindByIdAndUpdate.mockResolvedValue(submissionDoc(2_000, 50_000));

    const result = await updateSubmissionViews(SUB_ID.toString(), 50_000);

    expect(campaignUpdateOne).toHaveBeenCalledWith({ _id: CAMP_ID }, { $inc: { budgetSpent: -2_000 } });
    expect(campaignFindOneAndUpdate).toHaveBeenCalledTimes(1); // the retry owed nothing, so no second reservation
    expect(result.payout.paidNow).toBe(0);
    expect(result.submission.amountPaid).toBe(2_000);
  });

  it("does NOT release the reservation when the credit call throws (outcome unknown)", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValue(campaignDoc());
    campaignFindOneAndUpdate.mockResolvedValue(campaignDoc(2_000));
    submissionFindOneAndUpdate.mockRejectedValue(new Error("network blip"));

    await expect(updateSubmissionViews(SUB_ID.toString(), 50_000)).rejects.toThrow("network blip");
    expect(campaignUpdateOne).not.toHaveBeenCalled();
  });

  it("404s for an unknown submission", async () => {
    submissionFindById.mockResolvedValue(null);
    await expect(updateSubmissionViews(SUB_ID.toString(), 100)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("404s when the campaign is gone", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValue(null);
    await expect(updateSubmissionViews(SUB_ID.toString(), 100)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("gives up with a 409 after MAX_ATTEMPTS under constant contention", async () => {
    submissionFindById.mockResolvedValue(submissionDoc());
    campaignFindById.mockResolvedValue(campaignDoc());
    campaignFindOneAndUpdate.mockResolvedValue(null); // the reservation always loses

    await expect(updateSubmissionViews(SUB_ID.toString(), 50_000)).rejects.toMatchObject({
      statusCode: 409,
      code: "CONCURRENT_UPDATE",
    });
    expect(campaignFindOneAndUpdate).toHaveBeenCalledTimes(MAX_ATTEMPTS);
  });
});

describe("budgetGuard", () => {
  it("only matches while budgetSpent + amount still fits in totalBudget", () => {
    expect(budgetGuard(CAMP_ID, 500)).toEqual({
      _id: CAMP_ID,
      $expr: { $lte: [{ $add: ["$budgetSpent", 500] }, "$totalBudget"] },
    });
  });
});
