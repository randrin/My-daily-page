import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { SortDirection } from "@/lib/table-sort";
import { cn } from "@/lib/utils";

type SortableTableHeadProps<K extends string> = {
  label: string;
  sortKey: K;
  activeKey?: K | null;
  direction?: SortDirection;
  onSort: (key: K) => void;
  className?: string;
};

export function SortableTableHead<K extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: SortableTableHeadProps<K>) {
  const active = activeKey === sortKey;
  const ariaSort = !active
    ? "none"
    : direction === "desc"
      ? "descending"
      : "ascending";

  return (
    <th
      aria-sort={ariaSort}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {active ? (
          direction === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </th>
  );
}
