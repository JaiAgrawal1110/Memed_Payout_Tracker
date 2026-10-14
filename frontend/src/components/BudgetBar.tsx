import { formatINR } from "@/lib/format";

export function BudgetBar({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  return (
    <div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={spent}>
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="muted small">
        {formatINR(spent)} spent of {formatINR(total)} · <strong>{formatINR(Math.max(0, total - spent))} remaining</strong>
      </p>
    </div>
  );
}
