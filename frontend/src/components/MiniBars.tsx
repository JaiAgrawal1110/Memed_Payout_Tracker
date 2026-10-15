const COLORS = ["#b8a4e3", "#6cc3a0", "#4f86d6"];

/** Tiny bar chart of the last few values (oldest to newest). Heights are relative to the largest value. */
export function MiniBars({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(0, ...values);
  return (
    <div className="flex shrink-0 flex-col items-center gap-1" aria-hidden>
      <div className="flex h-11 items-end gap-1">
        {values.map((v, i) => {
          const h = max > 0 ? Math.max(6, Math.round((v / max) * 44)) : 6 + ((i * 5) % 14);
          return <span key={i} className="w-2 rounded-sm" style={{ height: h, background: COLORS[i % COLORS.length], opacity: max > 0 ? 1 : 0.55 }} />;
        })}
      </div>
      <span className="text-[10px] text-neutral-500">{label}</span>
    </div>
  );
}
