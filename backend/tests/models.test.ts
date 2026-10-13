import { Types, Error as MongooseError } from "mongoose";
import { Campaign } from "../src/models/Campaign";
import { User } from "../src/models/User";

const validCampaign = () => ({
  brand: new Types.ObjectId(),
  name: "Summer Drop",
  platform: "instagram",
  totalBudget: 10000,
  ladder: [{ views: 10000, payout: 500 }],
});

/** Runs document validation (no database needed) and returns the error, if any. */
async function validationError(doc: { validate: () => Promise<void> }): Promise<MongooseError.ValidationError | undefined> {
  try {
    await doc.validate();
    return undefined;
  } catch (err) {
    return err as MongooseError.ValidationError;
  }
}

describe("model validation (no database needed)", () => {
  it("accepts a valid campaign", async () => {
    expect(await validationError(new Campaign(validCampaign()))).toBeUndefined();
  });

  it("rejects an unknown platform", async () => {
    const err = await validationError(new Campaign({ ...validCampaign(), platform: "tiktok" }));
    expect(err?.errors.platform).toBeDefined();
  });

  it("rejects a zero budget and fractional payouts", async () => {
    const err = await validationError(
      new Campaign({ ...validCampaign(), totalBudget: 0, ladder: [{ views: 100, payout: 10.5 }] }),
    );
    expect(err?.errors.totalBudget).toBeDefined();
    expect(Object.keys(err?.errors ?? {}).some((k) => k.startsWith("ladder"))).toBe(true);
  });

  it("rejects an empty ladder", async () => {
    const err = await validationError(new Campaign({ ...validCampaign(), ladder: [] }));
    expect(err?.errors.ladder).toBeDefined();
  });

  it("rejects an invalid user role", async () => {
    const err = await validationError(new User({ name: "Jai", email: "a@b.com", passwordHash: "x", role: "admin" }));
    expect(err?.errors.role).toBeDefined();
  });
});
