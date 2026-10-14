import type { MilestoneStep } from "../types";

const fmt = (n: number): string => n.toLocaleString("en-IN");

/** A copy of the ladder ordered by ascending view threshold. */
export function sortLadder(ladder: readonly MilestoneStep[]): MilestoneStep[] {
  return [...ladder].sort((a, b) => a.views - b.views);
}

/**
 * Business rules for a milestone ladder. Returns human-readable problems (empty array = valid).
 * Input order doesn't matter; the ladder is judged as if sorted by views.
 *
 *  - view thresholds must be unique
 *  - payouts must strictly increase as views increase
 *  - the highest payout must not exceed the campaign's total budget
 */
export function findLadderProblems(ladder: readonly MilestoneStep[], totalBudget: number): string[] {
  const problems: string[] = [];
  const sorted = sortLadder(ladder);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (cur.views === prev.views) {
      problems.push(`Duplicate view threshold: ${fmt(cur.views)}`);
    } else if (cur.payout <= prev.payout) {
      problems.push(
        `Payout must increase with views: ${fmt(cur.views)} views pays ₹${fmt(cur.payout)}, ` +
          `which is not more than ₹${fmt(prev.payout)} for ${fmt(prev.views)} views`,
      );
    }
  }

  const top = sorted[sorted.length - 1];
  if (top && top.payout > totalBudget) {
    problems.push(`The highest payout (₹${fmt(top.payout)}) cannot exceed the total budget (₹${fmt(totalBudget)})`);
  }
  return problems;
}
