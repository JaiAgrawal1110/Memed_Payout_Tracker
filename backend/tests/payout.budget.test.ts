import { calculatePayout, getRemainingBudget, isCampaignLive } from "../src/services/payout.service";
import { LADDER } from "./fixtures";

/** Small deterministic PRNG so the randomised tests are reproducible. */
function makeRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("calculatePayout: budget cap", () => {
  it("pays in full when the budget covers it", () => {
    const r = calculatePayout(50_000, LADDER, 0, 2_000);
    expect(r.payout).toBe(2_000);
    expect(r.cappedByBudget).toBe(false);
  });

  it("pays only what is left when the budget runs out mid-payout", () => {
    const r = calculatePayout(50_000, LADDER, 0, 1_200);
    expect(r.payout).toBe(1_200);
    expect(r.newTotalPaid).toBe(1_200);
    expect(r.cappedByBudget).toBe(true);
  });

  it("pays nothing when the budget is already exhausted", () => {
    const r = calculatePayout(120_000, LADDER, 0, 0);
    expect(r.payout).toBe(0);
    expect(r.newTotalPaid).toBe(0);
    expect(r.cappedByBudget).toBe(true);
  });

  it("does not flag a cap when budget exactly equals the amount owed", () => {
    const r = calculatePayout(10_000, LADDER, 0, 500);
    expect(r.payout).toBe(500);
    expect(r.cappedByBudget).toBe(false);
  });

  it("never exceeds the remaining budget for any input (randomised)", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 2_000; i++) {
      const views = Math.floor(rng() * 200_000);
      const alreadyPaid = [0, 500, 2_000, 5_000][Math.floor(rng() * 4)];
      const remaining = Math.floor(rng() * 6_000);
      const r = calculatePayout(views, LADDER, alreadyPaid, remaining);

      expect(r.payout).toBeGreaterThanOrEqual(0);
      expect(r.payout).toBeLessThanOrEqual(remaining);
      expect(r.newTotalPaid).toBe(alreadyPaid + r.payout);
    }
  });

  it("keeps total spend within the budget when many creators share a campaign", () => {
    const rng = makeRng(42);
    const totalBudget = 10_000;
    const creators = 20;
    const paid = new Array<number>(creators).fill(0);
    const views = new Array<number>(creators).fill(0);
    let spent = 0;

    for (let i = 0; i < 500; i++) {
      const c = Math.floor(rng() * creators);
      views[c] += Math.floor(rng() * 30_000);
      const r = calculatePayout(views[c], LADDER, paid[c], totalBudget - spent);
      paid[c] = r.newTotalPaid;
      spent += r.payout;
      expect(spent).toBeLessThanOrEqual(totalBudget);
    }
    // Demand far exceeds the budget, so partial payouts should drain it exactly, with nothing stranded.
    expect(spent).toBe(totalBudget);
  });
});

describe("calculatePayout: idempotency and monotonicity", () => {
  it("does not pay twice when the same views are applied again", () => {
    const first = calculatePayout(50_000, LADDER, 0, 10_000);
    const second = calculatePayout(50_000, LADDER, first.newTotalPaid, 10_000 - first.payout);
    expect(first.payout).toBe(2_000);
    expect(second.payout).toBe(0);
    expect(second.newTotalPaid).toBe(2_000);
  });

  it("never claws back when views go down", () => {
    const r = calculatePayout(5_000, LADDER, 2_000, 10_000);
    expect(r.payout).toBe(0);
    expect(r.newTotalPaid).toBe(2_000);
  });

  it("never pays negative if the ladder's higher rung pays less than already paid", () => {
    const odd = [
      { views: 10_000, payout: 1_000 },
      { views: 20_000, payout: 400 },
    ];
    const r = calculatePayout(25_000, odd, 1_000, 10_000);
    expect(r.payout).toBe(0);
    expect(r.newTotalPaid).toBe(1_000);
  });
});

describe("calculatePayout: input validation", () => {
  it.each([
    ["negative views", () => calculatePayout(-1, LADDER, 0, 100)],
    ["fractional views", () => calculatePayout(10.5, LADDER, 0, 100)],
    ["NaN views", () => calculatePayout(Number.NaN, LADDER, 0, 100)],
    ["negative alreadyPaid", () => calculatePayout(10_000, LADDER, -5, 100)],
    ["negative remaining budget", () => calculatePayout(10_000, LADDER, 0, -1)],
  ])("throws RangeError for %s", (_label, call) => {
    expect(call).toThrow(RangeError);
  });
});

describe("budget helpers", () => {
  it("computes remaining budget", () => {
    expect(getRemainingBudget({ totalBudget: 10_000, budgetSpent: 2_500 })).toBe(7_500);
  });

  it("never reports negative remaining budget", () => {
    expect(getRemainingBudget({ totalBudget: 1_000, budgetSpent: 1_200 })).toBe(0);
  });

  it("is live only while budget remains", () => {
    expect(isCampaignLive({ totalBudget: 1_000, budgetSpent: 999 })).toBe(true);
    expect(isCampaignLive({ totalBudget: 1_000, budgetSpent: 1_000 })).toBe(false);
  });
});
