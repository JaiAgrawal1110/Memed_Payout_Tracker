import type { MilestoneStep } from "./types";

/** Highest milestone whose threshold the views have reached (inclusive), mirroring the backend rule. */
export function reachedMilestone(views: number, ladder: MilestoneStep[]): MilestoneStep | null {
  let best: MilestoneStep | null = null;
  for (const step of ladder) {
    if (views >= step.views && (best === null || step.views > best.views)) best = step;
  }
  return best;
}

/** The next milestone still ahead of the views, or null when the top one has been reached. */
export function nextMilestone(views: number, ladder: MilestoneStep[]): MilestoneStep | null {
  let next: MilestoneStep | null = null;
  for (const step of ladder) {
    if (step.views > views && (next === null || step.views < next.views)) next = step;
  }
  return next;
}
