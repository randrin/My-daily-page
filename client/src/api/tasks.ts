import { apiClient } from "@/api/client";
import { Task } from "@/types/task";

export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskInput = Partial<CreateTaskInput>;

type TaskResponse = Omit<Task, "createdAt" | "updatedAt" | "dueDate" | "toDoBefore" | "completedAt"> & {
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  toDoBefore?: string;
  completedAt?: string;
};

function parseTask(task: TaskResponse): Task {
  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    toDoBefore: task.toDoBefore ? new Date(task.toDoBefore) : undefined,
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  };
}

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<TaskResponse[]>("/tasks");
    return data.map(parseTask);
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return parseTask(data);
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post<TaskResponse>("/tasks", input);
    return parseTask(data);
  },

  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await apiClient.patch<TaskResponse>(`/tasks/${id}`, input);
    return parseTask(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
