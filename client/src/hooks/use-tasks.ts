import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  tasksApi,
  type CreateTaskInput,
  type TaskListQuery,
  type TaskRangeQuery,
  type UpdateTaskInput,
} from "@/api/tasks";
import type { Task } from "@/schemas/task.schema";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (query: TaskListQuery) => [...taskKeys.lists(), query] as const,
  ranges: () => [...taskKeys.all, "range"] as const,
  range: (query: TaskRangeQuery) => [...taskKeys.ranges(), query] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};

export function useTasks(query: TaskListQuery) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => tasksApi.list(query),
  });
}

export function useTasksInRange(query: TaskRangeQuery, enabled = true) {
  return useQuery({
    queryKey: taskKeys.range(query),
    queryFn: () => tasksApi.listInRange(query),
    enabled,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksApi.update(id, input),
    onSuccess: (task: Task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.setQueryData(taskKeys.detail(task.id), task);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
