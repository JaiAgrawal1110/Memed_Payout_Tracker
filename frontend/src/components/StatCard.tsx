import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  aside,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  /** Optional element on the right of the value (e.g. a mini chart). */
  aside?: ReactNode;
}) {
  return (
    <div className="card rise flex flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-neutral-700">{label}</span>
        {icon && <span className="text-neutral-800">{icon}</span>}
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-[28px] leading-tight font-bold tracking-tight text-neutral-900">{value}</div>
          {hint && <p className="mt-1 text-xs text-neutral-600">{hint}</p>}
        </div>
        {aside}
      </div>
    </div>
  );
}
