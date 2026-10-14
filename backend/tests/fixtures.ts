import type { MilestoneStep } from "../src/types";

/** The example ladder from the brief: 10K -> 500, 50K -> 2,000, 100K -> 5,000. */
export const LADDER: MilestoneStep[] = [
  { views: 10_000, payout: 500 },
  { views: 50_000, payout: 2_000 },
  { views: 100_000, payout: 5_000 },
];
