"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  categoryLabel,
  nextTaskStatus,
  taskPriorityColors,
  taskPriorityLabels,
  taskStatusColors,
  taskStatusLabels,
} from "@/utils/task-utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  return (
    <Card className="group relative gap-4 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className="absolute inset-y-0 left-0 z-10 w-1"
        style={{ backgroundColor: task.category?.color ?? "var(--border)" }}
        aria-hidden
      />
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
            {task.title}
          </CardTitle>
          <button
            type="button"
            className={cn(
              "shrink-0 rounded-md px-2 py-1 text-xs font-medium text-white",
              taskStatusColors[task.status],
            )}
            onClick={() =>
              onStatusChange?.(task.id, nextTaskStatus[task.status])
            }
            aria-label={`Statut ${taskStatusLabels[task.status]}, passer au suivant`}
          >
            {taskStatusLabels[task.status]}
          </button>
        </div>
        {task.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium text-white",
              taskPriorityColors[task.priority],
            )}
          >
            {taskPriorityLabels[task.priority]}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {task.category ? (
              <span
                className="size-2 shrink-0 rounded-full border"
                style={{ backgroundColor: task.category.color }}
                aria-hidden
              />
            ) : null}
            {categoryLabel(task)}
          </span>
        </div>
        {task.deadline ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span>Échéance : {formatDate(task.deadline)}</span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t bg-muted/40 px-5 py-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 font-medium"
          onClick={() => onEdit?.(task)}
        >
          <Pencil className="size-3.5" />
          Modifier
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 border-destructive/30 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete?.(task.id)}
        >
          <Trash2 className="size-3.5" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
}
