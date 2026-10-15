"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { CloseIcon, PlusIcon } from "./icons";

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
    <fieldset className="flex flex-col gap-3 rounded-xl border border-[#d9d4c6] bg-white/60 p-4">
      <legend className="px-2 text-sm font-semibold text-neutral-900">Milestone ladder</legend>
      <p className="text-xs text-neutral-600">
        A creator earns the payout of the <strong className="text-neutral-800">highest milestone</strong> their post has
        crossed. Milestones don&apos;t stack.
      </p>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="Views, e.g. 10000"
              aria-label={`Milestone ${i + 1} views`}
              value={row.views}
              onChange={(e) => update(i, "views", e.target.value)}
              className="w-full min-w-0"
            />
            <span aria-hidden className="text-neutral-500">
              →
            </span>
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="Payout ₹, e.g. 500"
              aria-label={`Milestone ${i + 1} payout`}
              value={row.payout}
              onChange={(e) => update(i, "payout", e.target.value)}
              className="w-full min-w-0"
            />
            <Button
              iconOnly
              size="sm"
              variant="ghost"
              aria-label={`Remove milestone ${i + 1}`}
              disabled={rows.length === 1}
              onPress={() => onChange(rows.filter((_, j) => j !== i))}
            >
              <CloseIcon />
            </Button>
          </div>
        ))}
      </div>

      <Button size="sm" appearance="outline" className="self-start" onPress={() => onChange([...rows, { views: "", payout: "" }])}>
        <PlusIcon className="size-4" /> Add milestone
      </Button>
    </fieldset>
  );
}
