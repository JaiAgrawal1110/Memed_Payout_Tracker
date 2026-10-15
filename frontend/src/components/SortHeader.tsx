import { TableHead } from "@/components/tailgrids/core/table";
import { SortIcon } from "./icons";

export type SortDir = "asc" | "desc";

/** A table header cell that toggles sorting, with the matching aria-sort for screen readers. */
export function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <TableHead aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition hover:text-neutral-900"
      >
        {label}
        <SortIcon className={`size-3.5 ${active ? "text-neutral-900" : "text-neutral-400"}`} />
      </button>
    </TableHead>
  );
}
