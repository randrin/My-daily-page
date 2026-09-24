import type { TaskPriority } from "@/schemas/task.schema";
import { cn } from "@/lib/utils";
import { taskPriorityColors, taskPriorityLabels } from "@/utils/task-utils";

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-1 text-xs font-medium text-white",
        taskPriorityColors[priority],
      )}
    >
      {taskPriorityLabels[priority]}
    </span>
  );
}
