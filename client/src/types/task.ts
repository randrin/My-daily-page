export type TaskStatus = "todo" | "in-process" | "done" | "complete";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskCategory =
  | "work"
  | "personal"
  | "shopping"
  | "health"
  | "finance"
  | "education"
  | "other";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  toDoBefore?: Date;
  completedAt?: Date;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  search?: string;
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
    field?: "dueDate" | "createdAt" | "completedAt";
  };
}
