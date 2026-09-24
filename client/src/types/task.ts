export type {
  Task,
  TaskFormInput,
  TaskPage,
  TaskPageSize,
  TaskPriority,
  TaskRange,
  TaskStatus,
} from "@/schemas/task.schema";

import type { TaskPriority, TaskStatus } from "@/schemas/task.schema";

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
};
