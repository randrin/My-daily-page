import { z } from "zod";
import { taskNoteSchema, taskNoteInputSchema } from "@/schemas/task-note.schema";
import { apiClient } from "@/api/client";
import { normalizeRichText } from "@/lib/rich-text/html";
import {
  taskPageSchema,
  taskRangeSchema,
  taskSchema,
  type Task,
  type TaskFormInput,
  type TaskPage,
  type TaskRange,
} from "@/schemas/task.schema";

export type TaskListQuery = {
  search?: string;
  status?: string[];
  priority?: string[];
  categoryId?: string[];
  deadlineFrom?: string;
  deadlineTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: 10 | 20 | 50 | 100;
};

export type TaskRangeQuery = {
  from?: string;
  to?: string;
};

export type CreateTaskInput = {
  amount?: string | null;
  currency?: "EUR" | "USD" | "XAF";
  reference?: string | null;
  recurrence?: "monthly" | null;
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  deadline?: string;
  categoryId?: string | null;
  blockerIds?: string[];
  imageUrl?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export function toTaskPayload(input: TaskFormInput): CreateTaskInput {
  return {
    amount: input.amount,
    currency: input.currency,
    reference: input.reference,
    recurrence: input.recurrence,
    title: input.title,
    description: normalizeRichText(input.description) || undefined,
    status: input.status,
    priority: input.priority,
    deadline: input.deadline?.toISOString(),
    categoryId: input.categoryId,
    blockerIds: input.blockerIds,
    imageUrl: input.imageUrl ?? null,
  };
}

function compactParams(query: TaskListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
  };

  if (query.search?.trim()) params.search = query.search.trim();
  if (query.status?.length) params.status = query.status.join(",");
  if (query.priority?.length) params.priority = query.priority.join(",");
  if (query.categoryId?.length) params.categoryId = query.categoryId.join(",");
  if (query.deadlineFrom) params.deadlineFrom = query.deadlineFrom;
  if (query.deadlineTo) params.deadlineTo = query.deadlineTo;
  if (query.createdFrom) params.createdFrom = query.createdFrom;
  if (query.createdTo) params.createdTo = query.createdTo;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortOrder) params.sortOrder = query.sortOrder;

  return params;
}

export const todayTasksSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  items: z.array(taskSchema).max(3),
});

export const tasksApi = {
  today: async () => {
    const { data } = await apiClient.get('/tasks/today');
    return todayTasksSchema.parse(data);
  },
  listNotes: async (id: string) => {
    const { data } = await apiClient.get(`/tasks/${id}/notes`);
    return z.array(taskNoteSchema).parse(data);
  },
  addNote: async (id: string, content: string) => {
    const input = taskNoteInputSchema.parse({ content });
    const { data } = await apiClient.post(`/tasks/${id}/notes`, input);
    return taskNoteSchema.parse(data);
  },
  list: async (query: TaskListQuery): Promise<TaskPage> => {
    const { data } = await apiClient.get("/tasks", {
      params: compactParams(query),
    });
    return taskPageSchema.parse(data);
  },

  listInRange: async (query: TaskRangeQuery = {}): Promise<TaskRange> => {
    const params: Record<string, string> = {};
    if (query.from) params.from = query.from;
    if (query.to) params.to = query.to;
    const { data } = await apiClient.get("/tasks/in-range", { params });
    return taskRangeSchema.parse(data);
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return taskSchema.parse(data);
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post("/tasks", input);
    return taskSchema.parse(data);
  },

  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}`, input);
    return taskSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
