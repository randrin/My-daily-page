import type { TaskStatus } from "@/schemas/task.schema";
import { cn } from "@/lib/utils";
import {
  nextTaskStatus,
  taskStatusColors,
  taskStatusLabels,
} from "@/utils/task-utils";

const badgeClassName =
  "inline-flex rounded-md px-2 py-1 text-xs font-medium text-white";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn(badgeClassName, taskStatusColors[status])}>
      {taskStatusLabels[status]}
    </span>
  );
}

export function TaskStatusCycleBadge({
  status,
  onCycle,
  className,
}: {
  status: TaskStatus;
  onCycle?: (next: TaskStatus) => void;
  className?: string;
}) {
  const next = nextTaskStatus(status);
  const label = taskStatusLabels[status];

  if (!next) {
    return (
      <span
        className={cn(
          badgeClassName,
          "cursor-default opacity-80",
          taskStatusColors[status],
          className,
        )}
        aria-label={`Statut ${label}, fin de parcours`}
      >
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(badgeClassName, taskStatusColors[status], className)}
      onClick={() => onCycle?.(next)}
      aria-label={`Statut ${label}, passer à ${taskStatusLabels[next]}`}
    >
      {label}
    </button>
  );
}
