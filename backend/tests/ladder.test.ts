import { findLadderProblems, sortLadder } from "../src/utils/ladder";
import { LADDER } from "./fixtures";

describe("sortLadder", () => {
  it("orders by views ascending without mutating the input", () => {
    const input = [LADDER[2], LADDER[0], LADDER[1]];
    expect(sortLadder(input)).toEqual(LADDER);
    expect(input[0]).toBe(LADDER[2]);
  });
});

describe("findLadderProblems", () => {
  it("accepts the example ladder", () => {
    expect(findLadderProblems(LADDER, 50_000)).toEqual([]);
  });

  it("accepts an unsorted ladder (order is normalised later)", () => {
    expect(findLadderProblems([LADDER[2], LADDER[0], LADDER[1]], 50_000)).toEqual([]);
  });

  it("rejects duplicate thresholds", () => {
    const problems = findLadderProblems(
      [
        { views: 10_000, payout: 500 },
        { views: 10_000, payout: 900 },
      ],
      50_000,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/Duplicate view threshold/);
  });

  it("rejects payouts that do not increase with views", () => {
    const flat = findLadderProblems(
      [
        { views: 10_000, payout: 500 },
        { views: 50_000, payout: 500 },
      ],
      50_000,
    );
    const lower = findLadderProblems(
      [
        { views: 10_000, payout: 500 },
        { views: 50_000, payout: 400 },
      ],
      50_000,
    );
    expect(flat[0]).toMatch(/Payout must increase/);
    expect(lower[0]).toMatch(/Payout must increase/);
  });

  it("rejects a top payout larger than the total budget", () => {
    const problems = findLadderProblems(LADDER, 4_999);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/cannot exceed the total budget/);
  });

  it("accepts a top payout exactly equal to the budget", () => {
    expect(findLadderProblems(LADDER, 5_000)).toEqual([]);
  });

  it("reports several problems at once", () => {
    const problems = findLadderProblems(
      [
        { views: 10_000, payout: 900 },
        { views: 10_000, payout: 500 },
        { views: 50_000, payout: 100 },
      ],
      50,
    );
    expect(problems.length).toBeGreaterThanOrEqual(2);
  });
});
