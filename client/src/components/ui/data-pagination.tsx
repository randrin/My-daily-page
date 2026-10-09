"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const defaultPageSizes = [10, 20, 50, 100] as const;

type DataPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pageCount?: number;
  pageSizes?: readonly number[];
  disabled?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DataPagination({
  page,
  pageSize,
  total,
  pageCount = Math.max(1, Math.ceil(total / pageSize)),
  pageSizes = defaultPageSizes,
  disabled = false,
  className,
  onPageChange,
  onPageSizeChange,
}: DataPaginationProps) {
  if (total <= 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {from}–{to} sur {total}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(pageSize)}
          disabled={disabled}
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="w-[140px]" aria-label="Taille de page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Page précédente"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span
            className="min-w-24 px-2 text-center text-sm"
            aria-live="polite"
          >
            Page {page} / {pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Page suivante"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </nav>
  );
}
