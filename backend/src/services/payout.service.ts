import type { MilestoneStep } from "../types";

export interface PayoutResult {
  /** Whole rupees to pay out now. Always >= 0 and never more than the remaining budget. */
  payout: number;
  /** `alreadyPaid + payout`: what the creator has received for this post after this update. */
  newTotalPaid: number;
  /** Highest milestone the post has crossed, or null if it hasn't reached the first one. */
  milestone: MilestoneStep | null;
  /** Total the creator is entitled to at the current views, before the budget cap is applied. */
  entitled: number;
  /** True when the campaign budget forced a smaller payout than was owed. */
  cappedByBudget: boolean;
}

function assertWholeNumber(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative whole number, got ${value}`);
  }
}

/**
 * The highest milestone whose threshold the views have reached (inclusive).
 * Works on any ladder order and never mutates its input.
 */
export function findHighestMilestone(views: number, ladder: readonly MilestoneStep[]): MilestoneStep | null {
  let best: MilestoneStep | null = null;
  for (const step of ladder) {
    if (views >= step.views && (best === null || step.views > best.views)) {
      best = step;
    }
  }
  return best;
}

/**
 * Pure payout calculation for one post.
 *
 * - The creator is entitled to the payout of the highest milestone crossed (milestones never stack).
 * - Only the difference from `alreadyPaid` is paid now, so repeating an update pays nothing extra
 *   and falling views never claw money back.
 * - The payout is capped at `remainingBudget`; if that is less than what is owed the creator gets
 *   the partial remainder (first come, first served) and `cappedByBudget` is true.
 */
export function calculatePayout(
  views: number,
  ladder: readonly MilestoneStep[],
  alreadyPaid: number,
  remainingBudget: number,
): PayoutResult {
  assertWholeNumber("views", views);
  assertWholeNumber("alreadyPaid", alreadyPaid);
  assertWholeNumber("remainingBudget", remainingBudget);

  const milestone = findHighestMilestone(views, ladder);
  const entitled = milestone?.payout ?? 0;
  const owed = Math.max(0, entitled - alreadyPaid);
  const payout = Math.min(owed, remainingBudget);

  return {
    payout,
    newTotalPaid: alreadyPaid + payout,
    milestone,
    entitled,
    cappedByBudget: payout < owed,
  };
}

interface BudgetFields {
  totalBudget: number;
  budgetSpent: number;
}

export function getRemainingBudget(campaign: BudgetFields): number {
  return Math.max(0, campaign.totalBudget - campaign.budgetSpent);
}

/** A campaign is live (visible to creators) while it still has budget left. */
export function isCampaignLive(campaign: BudgetFields): boolean {
  return getRemainingBudget(campaign) > 0;
}
