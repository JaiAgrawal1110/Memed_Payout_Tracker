import { formatINR, formatViews } from "@/lib/format";
import type { MilestoneStep } from "@/lib/types";

export function LadderList({ ladder }: { ladder: MilestoneStep[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ladder.map((step) => (
        <li key={step.views} className="rounded-lg border border-neutral-900 bg-white px-2.5 py-1 text-xs text-neutral-700">
          {formatViews(step.views)}→<strong className="font-semibold text-neutral-900">{formatINR(step.payout)}</strong>
        </li>
      ))}
    </ul>
  );
}
