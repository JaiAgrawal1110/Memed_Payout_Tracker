import { formatINR } from "@/lib/format";

/** Budget used vs total: dark track, coloured fill, a round thumb at the fill edge, and the spent/remaining line. */
export function BudgetBar({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const nearlyOut = pct >= 90;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          className="relative h-2.5 flex-1 rounded-full bg-[#3b4453]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Budget used"
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${nearlyOut ? "bg-amber-400" : "bg-gradient-to-r from-sky-300 to-violet-300"}`}
            style={{ width: `${pct}%` }}
          />
          <span
            className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border border-neutral-300 bg-white shadow"
            style={{ left: `calc(${pct}% - ${(pct / 100) * 14}px)` }}
          />
        </div>
        <span className="w-9 text-right text-xs text-neutral-600">{pct}%</span>
      </div>
      <p className="text-xs text-neutral-700">
        {formatINR(spent)} spent of {formatINR(total)} /{" "}
        <strong className="font-semibold text-neutral-900">{formatINR(Math.max(0, total - spent))} remaining</strong>
      </p>
    </div>
  );
}
