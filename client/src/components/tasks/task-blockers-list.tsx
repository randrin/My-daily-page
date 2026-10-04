"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "@/api/tasks";
import { taskKeys } from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import { Ban } from "lucide-react";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Task } from "@/schemas/task.schema";
import { unresolvedBlockers } from "@/utils/task-utils";

type Blocker = NonNullable<Task["blockers"]>[number];

function blockersLabel(count: number): string {
  return count === 1
    ? "Bloquée par 1 tâche"
    : `Bloquée par ${count} tâches`;
}

export function TaskBlockersList({
  blockers,
  taskTitle,
  className,
  onEdit,
}: {
  blockers?: Blocker[] | null;
  taskTitle?: string;
  className?: string;
  onEdit?: (task: Task) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const openTask = async (id: string) => {
    if (!onEdit || loadingId) return;
    setLoadingId(id);
    try {
      const task = await queryClient.fetchQuery({ queryKey: taskKeys.detail(id), queryFn: () => tasksApi.getById(id), staleTime: 0 });
      onEdit(task);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d’ouvrir la tâche"));
    } finally {
      setLoadingId(null);
    }
  };

  if (!blockers?.length) return null;

  const openBlockers = unresolvedBlockers({ blockers });
  if (!openBlockers.length) return null;

  const openCount = openBlockers.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-md text-left text-xs font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400",
            className,
          )}
          aria-label={`${blockersLabel(openCount)}${taskTitle ? ` pour ${taskTitle}` : ""}. Ouvrir la liste.`}
        >
          <Ban className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{blockersLabel(openCount)}</span>
        </button>
      </SheetTrigger>
      <SheetContent
        className="w-full gap-0 overflow-hidden p-0 sm:max-w-2xl"
        onPointerDownOutside={(event) => {
          const target = event.detail.originalEvent.target;
          if (target instanceof Element && target.closest('[data-slot="sheet-content"]')) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => event.preventDefault()}
      >
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>Tâches qui bloquent</SheetTitle>
          <SheetDescription>
            {taskTitle
              ? `« ${taskTitle} » attend ${openCount === 1 ? "cette tâche" : "ces tâches"}.`
              : "Ces tâches doivent être terminées avant de clôturer celle-ci."}
            {` ${openCount} encore ouverte${openCount > 1 ? "s" : ""}.`}
          </SheetDescription>
        </SheetHeader>
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 py-5">
          {openBlockers.map((blocker) => (
            <li
              key={blocker.id}
            >
              <button type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                disabled={!onEdit || loadingId !== null}
                aria-label={`Modifier ${blocker.title}`}
                aria-busy={loadingId === blocker.id}
                onClick={(event) => { event.stopPropagation(); void openTask(blocker.id); }}>
              <span className="min-w-0 truncate text-sm font-medium">
                {blocker.title}
              </span>
              <TaskStatusBadge status={blocker.status} />
              </button>
            </li>
          ))}
        </ul>
        <SheetFooter className="mt-0 flex-row justify-end border-t bg-background px-6 py-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
