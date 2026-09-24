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
  done: 3,
  archived: 4,
};

const taskPriorityRank: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "À faire",
  "in-process": "En cours",
  done: "Terminée",
  archived: "Archivée",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
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

export const nextTaskStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in-process",
  "in-process": "done",
  done: "archived",
  archived: "todo",
};

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
        return task.description?.trim() || null;
      case "priority":
        return taskPriorityRank[task.priority];
      case "category":
        return categoryLabel(task);
      case "deadline":
        return task.deadline ? new Date(task.deadline).getTime() : null;
    }
  });
}
