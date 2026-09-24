import type { TaskStatus } from "@/schemas/task.schema";
import { cn } from "@/lib/utils";
import { taskStatusColors, taskStatusLabels } from "@/utils/task-utils";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium text-white",
        taskStatusColors[status],
      )}
    >
      {taskStatusLabels[status]}
    </span>
  );
}
