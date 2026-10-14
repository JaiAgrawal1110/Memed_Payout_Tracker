import { createCampaignSchema, createSubmissionSchema, objectIdParamSchema } from "../src/schemas/campaign.schema";
import { LADDER } from "./fixtures";

const valid = { name: "Summer Drop", platform: "instagram", totalBudget: 50_000, ladder: LADDER };

describe("createCampaignSchema", () => {
  it("accepts a valid campaign", () => {
    expect(createCampaignSchema.safeParse(valid).success).toBe(true);
  });

  it("sorts an unsorted ladder ascending", () => {
    const parsed = createCampaignSchema.parse({ ...valid, ladder: [LADDER[2], LADDER[0], LADDER[1]] });
    expect(parsed.ladder).toEqual(LADDER);
  });

  it.each([
    ["unknown platform", { ...valid, platform: "tiktok" }],
    ["zero budget", { ...valid, totalBudget: 0 }],
    ["fractional budget", { ...valid, totalBudget: 100.5 }],
    ["budget sent as a string", { ...valid, totalBudget: "50000" }],
    ["empty ladder", { ...valid, ladder: [] }],
    ["ladder is not an array", { ...valid, ladder: "10000:500" }],
    ["missing ladder", { name: "x1", platform: "instagram", totalBudget: 100 }],
    ["zero threshold", { ...valid, ladder: [{ views: 0, payout: 100 }] }],
    ["negative payout", { ...valid, ladder: [{ views: 100, payout: -5 }] }],
    ["fractional payout", { ...valid, ladder: [{ views: 100, payout: 5.5 }] }],
    ["duplicate thresholds", { ...valid, ladder: [{ views: 100, payout: 5 }, { views: 100, payout: 9 }] }],
    ["non-increasing payouts", { ...valid, ladder: [{ views: 100, payout: 9 }, { views: 200, payout: 9 }] }],
    ["top payout above budget", { ...valid, totalBudget: 1_000 }],
    ["short name", { ...valid, name: "A" }],
    ["more than 20 milestones", { ...valid, ladder: Array.from({ length: 21 }, (_, i) => ({ views: (i + 1) * 100, payout: i + 1 })) }],
  ])("rejects %s", (_label, input) => {
    expect(createCampaignSchema.safeParse(input).success).toBe(false);
  });

  it("reports ladder rule violations on the ladder path", () => {
    const result = createCampaignSchema.safeParse({ ...valid, totalBudget: 1_000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["ladder"]);
  });
});

describe("createSubmissionSchema", () => {
  it("trims the link and requires it", () => {
    expect(createSubmissionSchema.parse({ postLink: "  https://instagram.com/p/abc  " }).postLink).toBe(
      "https://instagram.com/p/abc",
    );
    expect(createSubmissionSchema.safeParse({ postLink: "   " }).success).toBe(false);
    expect(createSubmissionSchema.safeParse({}).success).toBe(false);
  });
});

describe("objectIdParamSchema", () => {
  it("accepts a 24-char hex id and rejects anything else", () => {
    expect(objectIdParamSchema.safeParse({ id: "64b7f0f2a1b2c3d4e5f60718" }).success).toBe(true);
    expect(objectIdParamSchema.safeParse({ id: "not-an-id" }).success).toBe(false);
  });
});
