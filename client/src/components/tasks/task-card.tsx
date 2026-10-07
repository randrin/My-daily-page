"use client";

import { CalendarDays, Paperclip, Eye, Pencil, Trash2 } from "lucide-react";
import { TaskNotesDrawer } from "@/components/tasks/task-notes-drawer";
import type { Task } from "@/types/task";
import { TaskBlockersList } from "@/components/tasks/task-blockers-list";
import { TaskStatusCycleBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RichText } from "@/components/ui/rich-text";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isEmptyRichText } from "@/lib/rich-text/html";
import {
  categoryLabel,
  taskPriorityColors,
  taskPriorityLabels,
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
  const hasDescription = !isEmptyRichText(task.description);

  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className="absolute inset-y-0 left-0 z-10 w-1"
        style={{ backgroundColor: task.category?.color ?? "var(--border)" }}
        aria-hidden
      />
      <CardHeader className="gap-2 px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="h-10 overflow-hidden text-base font-semibold leading-snug line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1">
            {task.imageUrl ? (
              <Sheet>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Voir l’image de ${task.title}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Paperclip className="size-3.5" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Voir l’image</TooltipContent>
                </Tooltip>
                <SheetContent className="w-full sm:max-w-2xl">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="break-words">{task.title}</SheetTitle>
                    <SheetDescription>Aperçu de l’image jointe</SheetDescription>
                  </SheetHeader>
                  <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 pb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.imageUrl}
                      alt={`Image jointe à la tâche ${task.title}`}
                      className="max-h-full max-w-full rounded-md object-contain"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
            <TaskStatusCycleBadge
              status={task.status}
              className="shrink-0"
              onCycle={(status) => onStatusChange?.(task.id, status)}
            />
          </div>
        </div>
        <div className="h-10 overflow-hidden">
          {hasDescription ? (
            <RichText
              html={task.description}
              className="line-clamp-2 text-sm text-muted-foreground [&_ol]:mb-0 [&_p]:mb-0 [&_ul]:mb-0"
            />
          ) : (
            <p className="text-sm italic text-muted-foreground/70">
              Aucune description
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-2 pb-0">
        <div className="h-5 overflow-hidden">
          <TaskBlockersList blockers={task.blockers} taskTitle={task.title} onEdit={onEdit} />
        </div>
      </CardContent>
      <CardFooter className="mt-auto items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5 [.border-t]:pt-2.5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex h-7 items-center gap-2 overflow-hidden">
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
          <div className="inline-flex h-5 max-w-full items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {task.deadline
                ? `Échéance : ${formatDate(task.deadline)}`
                : "Sans échéance"}
            </span>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center rounded-lg border bg-background p-0.5 shadow-xs">
          <TaskNotesDrawer task={task} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`${task.status === "archived" ? "Consulter" : "Modifier"} ${task.title}`}
                onClick={() => onEdit?.(task)}
              >
                {task.status === "archived" ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{task.status === "archived" ? "Consulter" : "Modifier"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Supprimer ${task.title}`}
                onClick={() => onDelete?.(task.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
