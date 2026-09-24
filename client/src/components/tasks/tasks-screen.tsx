"use client";

import React from "react";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  X
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
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  CardGridSkeleton,
  PaginationSkeleton,
  TableListSkeleton
} from "@/components/ui/data-skeleton";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask
} from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import { rangeToIsoBounds, taskDatesToRange } from "@/lib/date-range";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";
import type { Task, TaskFormInput, TaskStatus } from "@/schemas/task.schema";
import { TASK_PAGE_SIZES, useTasksUiStore } from "@/stores/tasks.store";
import {
  countActiveTaskFilters,
  getAllPriorities,
  getAllStatuses,
} from "@/utils/task-utils";
import { firstLetterUppercase } from "@/utils";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    if (!value) {
      setDebounced(value);
      return;
    }
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function TasksScreen() {
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
    filters.deadlineTo
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
    pageSize
  };

  const tasksQuery = useTasks(query);
  const { data, isError, refetch } = tasksQuery;
  const showSkeleton = showQuerySkeleton(tasksQuery);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const editing = tasks.find((task) => task.id === selectedTaskId) ?? null;
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
          input: toTaskPayload(input)
        });
        toast.success("Tâche mise à jour");
      } else {
        await createTask.mutateAsync(toTaskPayload(input));
        toast.success("Tâche créée");
      }
      closeForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la tâche")
      );
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteTask.mutateAsync(pendingDeleteId);
      toast.success("Tâche supprimée");
      closeDelete();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de supprimer la tâche")
      );
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, input: { status } });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de changer le statut"));
    }
  };

  const setDeadlineRange = (range: DateRange | undefined) => {
    setFilters({
      deadlineFrom: range?.from,
      deadlineTo: range?.to ?? range?.from
    });
  };

  const setCreatedRange = (range: DateRange | undefined) => {
    setFilters({
      createdFrom: range?.from,
      createdTo: range?.to ?? range?.from
    });
  };

  const fromItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItem = Math.min(page * pageSize, total);

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tâches</h1>
            <p className="text-muted-foreground">
              Recherche, filtres et pagination. Vue liste ou cartes.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nouvelle tâche
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
                aria-label="Rechercher une tâche"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode("table")}
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
                  onClick={() => setViewMode("grid")}
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
                    ? `Filtres, ${activeFilterCount} actif${activeFilterCount > 1 ? "s" : ""}`
                    : "Filtres"
                }
              >
                <Filter className="h-4 w-4" />
                Filtres
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
                  Réinitialiser
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
                  Statut
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({
                      status: value as typeof filters.status
                    })
                  }
                >
                  <SelectTrigger id="filter-status" className="w-full">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
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
                  Catégorie
                </label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    setFilters({
                      categoryId: value as typeof filters.categoryId
                    })
                  }
                >
                  <SelectTrigger id="filter-category" className="w-full">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
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
                  Priorité
                </label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) =>
                    setFilters({
                      priority: value as typeof filters.priority
                    })
                  }
                >
                  <SelectTrigger id="filter-priority" className="w-full">
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    {getAllPriorities().map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <TaskPriorityBadge priority={priority} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Échéance</p>
                <DateRangePicker
                  value={deadlineRange}
                  onChange={setDeadlineRange}
                  placeholder="Période d’échéance"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Date de création</p>
                <DateRangePicker
                  value={createdRange}
                  onChange={setCreatedRange}
                  placeholder="Période de création"
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
          <div className="flex flex-col items-start gap-3 rounded-xl border px-4 py-6 text-sm">
            <p className="text-destructive">
              Impossible de charger tes tâches.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!showSkeleton && !isError && tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border py-12 text-center">
            <CheckSquare className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Aucune tâche ne correspond à tes filtres."
                : "Aucune tâche pour l’instant."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Effacer les filtres
              </Button>
            ) : (
              <Button variant="outline" onClick={openCreate}>
                Créer la première
              </Button>
            )}
          </div>
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        {!showSkeleton && !isError && total > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {fromItem}–{toItem} sur {total}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(value) =>
                  setPageSize(Number(value) as (typeof TASK_PAGE_SIZES)[number])
                }
              >
                <SelectTrigger
                  className="w-[140px]"
                  aria-label="Taille de page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Page précédente"
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-24 px-2 text-center text-sm">
                  Page {page} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage(page + 1)}
                  aria-label="Page suivante"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
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

      <Sheet
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
      >
        <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="border-b px-6 py-5 pr-12">
            <SheetTitle>Supprimer la tâche</SheetTitle>
            <SheetDescription>
              {pendingDelete
                ? `« ${pendingDelete.title} » sera définitivement retirée.`
                : "Cette action est définitive."}
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDelete}
              disabled={deleteTask.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
