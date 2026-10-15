"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { ListTodo } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { useTaskDefaults } from "@/hooks/use-personalization";

import { FeedbackState } from "@/components/ui/feedback-state";
import React from "react";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  CheckSquare,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { toTaskPayload } from "@/api/tasks";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskTable } from "@/components/tasks/task-table";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CardGridSkeleton,
  PaginationSkeleton,
  TableListSkeleton,
} from "@/components/ui/data-skeleton";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useTask,
  useUpdateTask,
} from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import { rangeToIsoBounds, taskDatesToRange } from "@/lib/date-range";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";
import type { Task, TaskFormInput, TaskStatus } from "@/schemas/task.schema";
import { TASK_PAGE_SIZES, useTasksUiStore } from "@/stores/tasks.store";
import {
  canMarkTaskComplete,
  countActiveTaskFilters,
  getAllPriorities,
  getAllStatuses,
  TASK_CANNOT_COMPLETE_WHILE_BLOCKED,
} from "@/utils/task-utils";
import { firstLetterUppercase } from "@/utils";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced(value),
      value ? delay : 0,
    );
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function TasksScreen() {
  const t = useTranslator();
  const defaults = useTaskDefaults();
  const defaultsApplied = React.useRef(false);
  React.useEffect(() => {
    if (!defaults.data || defaultsApplied.current) return;
    defaultsApplied.current = true;
    useTasksUiStore.getState().setViewMode(defaults.data.taskView);
    useTasksUiStore.getState().setSort({
      key: defaults.data.taskSort,
      direction: defaults.data.sortDirection,
    });
  }, [defaults.data]);
  const { data: categories = [] } = useCategories();
  const viewMode = useTasksUiStore((s) => s.viewMode);
  const page = useTasksUiStore((s) => s.page);
  const pageSize = useTasksUiStore((s) => s.pageSize);
  const filters = useTasksUiStore((s) => s.filters);
  const sort = useTasksUiStore((s) => s.sort);
  const isFormOpen = useTasksUiStore((s) => s.isFormOpen);
  const selectedTaskId = useTasksUiStore((s) => s.selectedTaskId);
  const pendingDeleteId = useTasksUiStore((s) => s.pendingDeleteId);
  const setViewMode = useTasksUiStore((s) => s.setViewMode);
  const setPage = useTasksUiStore((s) => s.setPage);
  const setPageSize = useTasksUiStore((s) => s.setPageSize);
  const setFilters = useTasksUiStore((s) => s.setFilters);
  const setSort = useTasksUiStore((s) => s.setSort);
  const resetFilters = useTasksUiStore((s) => s.resetFilters);
  const openCreate = useTasksUiStore((s) => s.openCreate);
  const openEdit = useTasksUiStore((s) => s.openEdit);
  const closeForm = useTasksUiStore((s) => s.closeForm);
  const askDelete = useTasksUiStore((s) => s.askDelete);
  const closeDelete = useTasksUiStore((s) => s.closeDelete);

  const [showFilters, setShowFilters] = React.useState(true);
  const debouncedSearch = useDebouncedValue(filters.search);

  const deadlineRange = taskDatesToRange(
    filters.deadlineFrom,
    filters.deadlineTo,
  );
  const createdRange = taskDatesToRange(filters.createdFrom, filters.createdTo);
  const deadlineBounds = rangeToIsoBounds(deadlineRange);
  const createdBounds = rangeToIsoBounds(createdRange);

  const query = {
    search: debouncedSearch,
    status: filters.status === "all" ? undefined : [filters.status],
    priority: filters.priority === "all" ? undefined : [filters.priority],
    categoryId: filters.categoryId === "all" ? undefined : [filters.categoryId],
    deadlineFrom: deadlineBounds.from,
    deadlineTo: deadlineBounds.to,
    createdFrom: createdBounds.from,
    createdTo: createdBounds.to,
    sortBy: sort?.key,
    sortOrder: sort?.direction,
    page,
    pageSize,
  };

  const tasksQuery = useTasks(query);
  const { data, isError, refetch } = tasksQuery;
  const showSkeleton = showQuerySkeleton(tasksQuery);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const editingQuery = useTask(isFormOpen ? (selectedTaskId ?? "") : "");
  const editing =
    editingQuery.data ??
    tasks.find((task) => task.id === selectedTaskId) ??
    null;
  const pendingDelete =
    tasks.find((task) => task.id === pendingDeleteId) ?? null;
  const isSaving = createTask.isPending || updateTask.isPending;

  const activeFilterCount = countActiveTaskFilters(filters);
  const hasActiveFilters = Boolean(filters.search || activeFilterCount);

  const handleSubmit = async (input: TaskFormInput) => {
    try {
      if (selectedTaskId) {
        await updateTask.mutateAsync({
          id: selectedTaskId,
          input: toTaskPayload(input),
        });
        toast.success(t("messages.taskUpdated2"));
      } else {
        await createTask.mutateAsync(toTaskPayload(input));
        toast.success(t("messages.taskCreated"));
      }
      closeForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSaveTask")),
      );
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteTask.mutateAsync(pendingDeleteId);
      toast.success(t("messages.taskDeleted"));
      closeDelete();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToDeleteTask")),
      );
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const current = tasks.find((task) => task.id === taskId);
    if (
      current &&
      (status === "done" || status === "archived") &&
      !canMarkTaskComplete(current)
    ) {
      toast.error(TASK_CANNOT_COMPLETE_WHILE_BLOCKED);
      return;
    }

    try {
      await updateTask.mutateAsync({ id: taskId, input: { status } });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de changer le statut"));
    }
  };

  const setDeadlineRange = (range: DateRange | undefined) => {
    setFilters({
      deadlineFrom: range?.from,
      deadlineTo: range?.to ?? range?.from,
    });
  };

  const setCreatedRange = (range: DateRange | undefined) => {
    setFilters({
      createdFrom: range?.from,
      createdTo: range?.to ?? range?.from,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageTitle icon={ListTodo}>
              <Localized>{t("navigation.tasks")}</Localized>
            </PageTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              <Localized>
                {t("messages.searchFiltersAndPaginationTableOrCardView")}
              </Localized>
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <Localized>{t("messages.newTask2")}</Localized>
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Rechercher un titre ou une description…"
                className="pl-9"
                aria-label={t("messages.searchTasks")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    defaultsApplied.current = true;
                    setViewMode("table");
                  }}
                  aria-label="Vue liste"
                  aria-pressed={viewMode === "table"}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    defaultsApplied.current = true;
                    setViewMode("grid");
                  }}
                  aria-label="Vue cartes"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters((open) => !open)}
                aria-label={
                  activeFilterCount > 0
                    ? `Filtres, ${activeFilterCount} actif${
                        activeFilterCount > 1 ? "s" : ""
                      }`
                    : t("messages.filters")
                }
              >
                <Filter className="h-4 w-4" />
                <Localized>{t("messages.filters")}</Localized>
                {activeFilterCount > 0 ? (
                  <span
                    className={cn(
                      "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                      showFilters
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
              {hasActiveFilters ? (
                <Button type="button" variant="ghost" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                  <Localized>{t("common.reset")}</Localized>
                </Button>
              ) : null}
            </div>
          </div>

          {showFilters ? (
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="filter-status"
                >
                  <Localized>{t("tasks.status")}</Localized>
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({
                      status: value as typeof filters.status,
                    })
                  }
                >
                  <SelectTrigger id="filter-status" className="w-full">
                    <SelectValue placeholder={t("messages.allStatuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <Localized>{t("messages.allStatuses")}</Localized>
                    </SelectItem>
                    {getAllStatuses().map((status) => (
                      <SelectItem key={status} value={status}>
                        <TaskStatusBadge status={status} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="filter-category"
                >
                  <Localized>{t("tasks.category")}</Localized>
                </label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    setFilters({
                      categoryId: value as typeof filters.categoryId,
                    })
                  }
                >
                  <SelectTrigger id="filter-category" className="w-full">
                    <SelectValue placeholder={t("messages.allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <Localized>{t("messages.allCategories")}</Localized>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full border"
                            style={{ backgroundColor: category.color }}
                            aria-hidden
                          />
                          <span className="truncate">
                            {firstLetterUppercase(category.name)}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="filter-priority"
                >
                  <Localized>{t("tasks.priority")}</Localized>
                </label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) =>
                    setFilters({
                      priority: value as typeof filters.priority,
                    })
                  }
                >
                  <SelectTrigger id="filter-priority" className="w-full">
                    <SelectValue placeholder={t("messages.allPriorities")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <Localized>{t("messages.allPriorities")}</Localized>
                    </SelectItem>
                    {getAllPriorities().map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <TaskPriorityBadge priority={priority} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  <Localized>{t("tasks.dueDate")}</Localized>
                </p>
                <DateRangePicker
                  value={deadlineRange}
                  onChange={setDeadlineRange}
                  placeholder={t("messages.dueDateRange")}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  <Localized>{t("messages.creationDate")}</Localized>
                </p>
                <DateRangePicker
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder={t("messages.creationDateRange")}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showSkeleton ? (
          <div aria-busy="true" aria-live="polite" data-slot="tasks-loading">
            {viewMode === "table" ? (
              <TableListSkeleton rows={6} columns={7} />
            ) : (
              <CardGridSkeleton cards={6} />
            )}
            <div className="mt-4">
              <PaginationSkeleton />
            </div>
          </div>
        ) : null}

        {isError ? (
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadYourTasks")}
          >
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : null}

        {!showSkeleton && !isError && tasks.length === 0 ? (
          <FeedbackState
            icon={CheckSquare}
            description={
              hasActiveFilters
                ? t("messages.noTasksMatchYourFilters")
                : t("messages.noTasksYet")
            }
          >
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                <Localized>{t("messages.clearFilters")}</Localized>
              </Button>
            ) : (
              <Button variant="outline" onClick={openCreate}>
                <Localized>{t("messages.createYourFirst")}</Localized>
              </Button>
            )}
          </FeedbackState>
        ) : null}

        {!showSkeleton && !isError && tasks.length > 0 ? (
          viewMode === "table" ? (
            <TaskTable
              tasks={tasks}
              sort={sort}
              onSortChange={setSort}
              onEdit={(task: Task) => openEdit(task.id)}
              onDelete={askDelete}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(item) => openEdit(item.id)}
                  onDelete={askDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        ) : null}

        {!showSkeleton && !isError ? (
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={total}
            pageSizes={TASK_PAGE_SIZES}
            onPageChange={setPage}
            onPageSizeChange={(size) =>
              setPageSize(size as (typeof TASK_PAGE_SIZES)[number])
            }
          />
        ) : null}
      </div>

      <TaskForm
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        task={editing}
        categories={categories}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <DialogTitle>
              <Localized>{t("messages.deleteTask")}</Localized>
            </DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.title} » sera définitivement retirée.`
                : t("messages.thisActionIsPermanent")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t bg-background mt-0 flex-row justify-end gap-2 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeDelete}
              disabled={deleteTask.isPending}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteTask.isPending ? "Suppression…" : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
