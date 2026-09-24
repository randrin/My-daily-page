import { create } from "zustand";
import type { SortState } from "@/lib/table-sort";
import type { TaskPageSize, TaskPriority, TaskStatus } from "@/schemas/task.schema";
import type { TaskSortKey } from "@/utils/task-utils";

export const TASK_PAGE_SIZES = [10, 20, 50, 100] as const;

export type TaskViewMode = "table" | "grid";

export type TaskListFilters = {
  search: string;
  status: TaskStatus | "all";
  categoryId: string | "all";
  priority: TaskPriority | "all";
  deadlineFrom?: Date;
  deadlineTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
};

const defaultFilters: TaskListFilters = {
  search: "",
  status: "all",
  categoryId: "all",
  priority: "all",
};

type TasksUiState = {
  viewMode: TaskViewMode;
  page: number;
  pageSize: TaskPageSize;
  filters: TaskListFilters;
  sort: SortState<TaskSortKey> | null;
  isFormOpen: boolean;
  selectedTaskId: string | null;
  pendingDeleteId: string | null;
  setViewMode: (viewMode: TaskViewMode) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: TaskPageSize) => void;
  setFilters: (patch: Partial<TaskListFilters>) => void;
  setSort: (sort: SortState<TaskSortKey>) => void;
  resetFilters: () => void;
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeForm: () => void;
  askDelete: (id: string) => void;
  closeDelete: () => void;
};

export const useTasksUiStore = create<TasksUiState>((set) => ({
  viewMode: "table",
  page: 1,
  pageSize: 10,
  filters: defaultFilters,
  sort: null,
  isFormOpen: false,
  selectedTaskId: null,
  pendingDeleteId: null,
  setViewMode: (viewMode) => set({ viewMode }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setFilters: (patch) =>
    set((state) => ({
      filters: { ...state.filters, ...patch },
      page: 1,
    })),
  setSort: (sort) => set({ sort, page: 1 }),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),
  openCreate: () => set({ isFormOpen: true, selectedTaskId: null }),
  openEdit: (id) => set({ isFormOpen: true, selectedTaskId: id }),
  closeForm: () => set({ isFormOpen: false, selectedTaskId: null }),
  askDelete: (id) => set({ pendingDeleteId: id }),
  closeDelete: () => set({ pendingDeleteId: null }),
}));
