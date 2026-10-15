import type { ReactNode } from "react";
import { Label } from "@/components/tailgrids/core/label";

/** Label + control + optional hint, wired together with htmlFor. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="font-medium text-neutral-800">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
