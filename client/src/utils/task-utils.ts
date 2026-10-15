import { stripRichText } from "@/lib/rich-text/html";
import type { SortState } from "@/lib/table-sort";
import { sortBy } from "@/lib/table-sort";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { firstLetterUppercase } from "@/utils/helpers";

export const TASK_SORT_KEYS = [
  "status",
  "title",
  "description",
  "priority",
  "category",
  "deadline",
] as const;

export type TaskSortKey = (typeof TASK_SORT_KEYS)[number];

const taskStatusRank: Record<TaskStatus, number> = {
  todo: 1,
  "in-process": 2,
  blocked: 3,
  done: 4,
  archived: 5,
};

const taskPriorityRank: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "tasks.status.todo",
  "in-process": "tasks.status.inProgress",
  blocked: "tasks.status.blocked",
  done: "tasks.status.done",
  archived: "tasks.status.archived",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "messages.low",
  medium: "messages.medium",
  high: "messages.high",
  urgent: "messages.urgent",
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export const taskStatusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-500",
  "in-process": "bg-blue-500",
  blocked: "bg-amber-600",
  done: "bg-green-500",
  archived: "bg-purple-500",
};

export const getAllPriorities = (): TaskPriority[] => {
  return Object.keys(taskPriorityLabels) as TaskPriority[];
};

export const getAllStatuses = (): TaskStatus[] => {
  return Object.keys(taskStatusLabels) as TaskStatus[];
};

export function categoryLabel(task: Task): string {
  return firstLetterUppercase(task.category?.name as string) ?? "Sans catégorie";
}

export function nextTaskStatus(status: TaskStatus): TaskStatus | null {
  switch (status) {
    case "todo":
      return "in-process";
    case "in-process":
    case "blocked":
      return "done";
    case "done":
      return "archived";
    case "archived":
      return null;
  }
}

export const TASK_CANNOT_COMPLETE_WHILE_BLOCKED =
  "Cette tâche ne peut pas être terminée ou archivée tant que ses tâches bloqueuses ne sont pas terminées";

export function isTaskFinished(status: TaskStatus): boolean {
  return status === "done" || status === "archived";
}

export function unresolvedBlockers(task: Pick<Task, "blockers">) {
  return (task.blockers ?? []).filter((blocker) => blocker.status === "in-process" || blocker.status === "todo");
}

export function canMarkTaskComplete(task: Pick<Task, "blockers">): boolean {
  return unresolvedBlockers(task).length === 0;
}

export function countActiveTaskFilters(filters: {
  status: string;
  categoryId: string;
  priority: string;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}): number {
  return [
    filters.status !== "all",
    filters.categoryId !== "all",
    filters.priority !== "all",
    Boolean(filters.deadlineFrom || filters.deadlineTo),
    Boolean(filters.createdFrom || filters.createdTo),
  ].filter(Boolean).length;
}

export function sortTasks(
  tasks: Task[],
  sort: SortState<TaskSortKey> | null,
): Task[] {
  return sortBy(tasks, sort, (task, key) => {
    switch (key) {
      case "status":
        return taskStatusRank[task.status];
      case "title":
        return task.title;
      case "description":
        return stripRichText(task.description ?? "") || null;
      case "priority":
        return taskPriorityRank[task.priority];
      case "category":
        return categoryLabel(task);
      case "deadline":
        return task.deadline ? new Date(task.deadline).getTime() : null;
    }
  });
}
