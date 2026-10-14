import { formatINR, formatViews } from "@/lib/format";
import type { MilestoneStep } from "@/lib/types";

export function LadderList({ ladder }: { ladder: MilestoneStep[] }) {
  return (
    <ul className="ladder">
      {ladder.map((step) => (
        <li key={step.views}>
          {formatViews(step.views)} views → <strong>{formatINR(step.payout)}</strong>
        </li>
      ))}
    </ul>
  );
}
