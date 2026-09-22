"use client";

import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 text-foreground", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <NotebookPen className="size-4" />
      </span>
      {compact ? null : (
        <span className="font-semibold tracking-tight">My Daily Page</span>
      )}
    </Link>
  );
}
