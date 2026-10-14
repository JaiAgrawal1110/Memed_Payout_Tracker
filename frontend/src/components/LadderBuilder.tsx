"use client";

export interface LadderRow {
  views: string;
  payout: string;
}

interface Props {
  rows: LadderRow[];
  onChange: (rows: LadderRow[]) => void;
}

export function LadderBuilder({ rows, onChange }: Props) {
  const update = (index: number, field: keyof LadderRow, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  return (
    <fieldset className="ladder-builder">
      <legend>Milestone ladder</legend>
      <p className="muted small">The creator earns the payout of the highest milestone their post has crossed.</p>
      {rows.map((row, i) => (
        <div className="ladder-row" key={i}>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="Views (e.g. 10000)"
            aria-label={`Milestone ${i + 1} views`}
            value={row.views}
            onChange={(e) => update(i, "views", e.target.value)}
          />
          <span aria-hidden>→</span>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="Payout ₹ (e.g. 500)"
            aria-label={`Milestone ${i + 1} payout`}
            value={row.payout}
            onChange={(e) => update(i, "payout", e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            disabled={rows.length === 1}
            aria-label={`Remove milestone ${i + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => onChange([...rows, { views: "", payout: "" }])}>
        + Add milestone
      </button>
    </fieldset>
  );
}
