import { calculatePayout, findHighestMilestone } from "../src/services/payout.service";
import { LADDER } from "./fixtures";

describe("findHighestMilestone", () => {
  it("returns null below the first threshold", () => {
    expect(findHighestMilestone(9_999, LADDER)).toBeNull();
  });

  it("treats a threshold as crossed when views are exactly equal", () => {
    expect(findHighestMilestone(10_000, LADDER)).toEqual({ views: 10_000, payout: 500 });
  });

  it("returns the highest crossed milestone, not the first", () => {
    expect(findHighestMilestone(75_000, LADDER)).toEqual({ views: 50_000, payout: 2_000 });
  });

  it("does not depend on the ladder being sorted, and does not mutate it", () => {
    const shuffled = [LADDER[2], LADDER[0], LADDER[1]];
    const snapshot = JSON.stringify(shuffled);
    expect(findHighestMilestone(60_000, shuffled)).toEqual({ views: 50_000, payout: 2_000 });
    expect(JSON.stringify(shuffled)).toBe(snapshot);
  });

  it("returns null for an empty ladder", () => {
    expect(findHighestMilestone(1_000_000, [])).toBeNull();
  });
});

describe("calculatePayout: milestones", () => {
  const BIG_BUDGET = 1_000_000;

  it("pays nothing below the first milestone", () => {
    const r = calculatePayout(9_999, LADDER, 0, BIG_BUDGET);
    expect(r.payout).toBe(0);
    expect(r.newTotalPaid).toBe(0);
    expect(r.milestone).toBeNull();
  });

  it("pays the first milestone when it is crossed", () => {
    const r = calculatePayout(10_000, LADDER, 0, BIG_BUDGET);
    expect(r.payout).toBe(500);
    expect(r.newTotalPaid).toBe(500);
  });

  it("pays only the highest milestone when several are crossed in one update (no stacking)", () => {
    const r = calculatePayout(120_000, LADDER, 0, BIG_BUDGET);
    expect(r.payout).toBe(5_000); // not 500 + 2,000 + 5,000
    expect(r.newTotalPaid).toBe(5_000);
  });

  it("pays only the difference when a higher milestone is reached later", () => {
    const r = calculatePayout(60_000, LADDER, 500, BIG_BUDGET);
    expect(r.payout).toBe(1_500); // 2,000 entitled - 500 already paid
    expect(r.newTotalPaid).toBe(2_000);
  });

  it("reports what the creator is entitled to at the current views", () => {
    expect(calculatePayout(60_000, LADDER, 0, BIG_BUDGET).entitled).toBe(2_000);
  });
});
