"use client";

import type { DateRange } from "react-day-picker";
import { Calendar1Icon, Filter, LayoutGrid, List, Search, X } from "lucide-react";
import React from "react";
import { TaskCalendar } from "./task-calendar";
import { TaskCard } from "./task-card";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskTable } from "./task-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskDatesToRange } from "@/lib/date-range";
import { cn } from "@/lib/utils";
import type { Category } from "@/schemas/category.schema";
import { Task, TaskFilters } from "@/types/task";
import { firstLetterUppercase } from "@/utils/helpers";
import {
  countActiveTaskFilters,
  getAllPriorities,
  getAllStatuses,
} from "@/utils/task-utils";

function isDateInRange(
  value: Date | null | undefined,
  from?: Date,
  to?: Date,
): boolean {
  if (!value) return false;
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    if (day < start) return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (day > end) return false;
  }
  return true;
}

interface TaskListProps {
  tasks: Task[];
  categories?: Category[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
  filters?: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
}

export function TaskList({
  tasks,
  categories = [],
  onEdit,
  onDelete,
  onStatusChange,
  filters = {},
  onFiltersChange,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || "");
  const [showFilters, setShowFilters] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<"7" | "30">("30");
  const [viewMode, setViewMode] = React.useState<"card" | "table" | "calendar">(
    "card",
  );

  React.useEffect(() => {
    const saved = localStorage.getItem("taskViewMode");
    if (saved === "card" || saved === "table" || saved === "calendar") {
      setViewMode(saved);
    }
  }, []);

  const changeViewMode = (mode: "card" | "table" | "calendar") => {
    setViewMode(mode);
    localStorage.setItem("taskViewMode", mode);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange?.({ ...filters, search: value || undefined });
  };

  const categoryOptions = React.useMemo(() => {
    if (categories.length > 0) return categories;
    const seen = new Map<string, Category>();
    for (const task of tasks) {
      if (task.category && !seen.has(task.category.id)) {
        seen.set(task.category.id, {
          id: task.category.id,
          name: task.category.name,
          color: task.category.color,
          userId: task.category.userId ?? "",
        });
      }
    }
    return [...seen.values()];
  }, [categories, tasks]);

  const deadlineRange = taskDatesToRange(
    filters.deadlineFrom,
    filters.deadlineTo,
  );
  const createdRange = taskDatesToRange(filters.createdFrom, filters.createdTo);

  const patchFilters = (patch: Partial<TaskFilters>) => {
    onFiltersChange?.({ ...filters, ...patch });
  };

  const setDeadlineRange = (range: DateRange | undefined) => {
    patchFilters({
      deadlineFrom: range?.from,
      deadlineTo: range?.to ?? range?.from,
    });
  };

  const setCreatedRange = (range: DateRange | undefined) => {
    patchFilters({
      createdFrom: range?.from,
      createdTo: range?.to ?? range?.from,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    onFiltersChange?.({});
  };

  const activeFilterCount = countActiveTaskFilters({
    status: filters.status ?? "all",
    categoryId: filters.categoryId ?? "all",
    priority: filters.priority ?? "all",
    deadlineFrom: filters.deadlineFrom,
    deadlineTo: filters.deadlineTo,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
  });
  const hasActiveFilters = Boolean(filters.search || activeFilterCount);

  const filteredTasks = tasks.filter((task) => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.categoryId && task.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Time range filter (7G/30G)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const daysAgo = new Date(today);
    daysAgo.setDate(daysAgo.getDate() - (timeRange === "7" ? 7 : 30));
    daysAgo.setHours(0, 0, 0, 0);
    
    // Check if task has a date field that falls within the time range
    const taskDate = task.deadline || task.createdAt;
    if (taskDate) {
      const taskDateOnly = new Date(taskDate);
      taskDateOnly.setHours(0, 0, 0, 0);
      if (taskDateOnly < daysAgo || taskDateOnly > today) {
        return false;
      }
    } else {
      // If task has no date, only show if timeRange is 30G (show all)
      if (timeRange === "7") {
        return false;
      }
    }
    
    if (
      (filters.deadlineFrom || filters.deadlineTo) &&
      !isDateInRange(task.deadline, filters.deadlineFrom, filters.deadlineTo)
    ) {
      return false;
    }

    if (
      (filters.createdFrom || filters.createdTo) &&
      !isDateInRange(task.createdAt, filters.createdFrom, filters.createdTo)
    ) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex items-center gap-2">
              {/* Time Range Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant={timeRange === "7" ? "default" : "outline"}
                  size="sm"
                  className="h-7"
                  onClick={() => setTimeRange("7")}
                >
                  7G
                </Button>
                <Button
                  variant={timeRange === "30" ? "default" : "outline"}
                  size="sm"
                  className="h-7"
                  onClick={() => setTimeRange("30")}
                >
                  30G
                </Button>
              </div>
              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "card" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => changeViewMode("card")}
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => changeViewMode("table")}
                  aria-label="Table view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => changeViewMode("calendar")}
                  aria-label="Calendar view"
                >
                  <Calendar1Icon className="h-4 w-4" />
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
                <Button type="button" variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Réinitialiser
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {showFilters ? (
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="dashboard-filter-status"
                >
                  Statut
                </label>
                <Select
                  value={filters.status ?? "all"}
                  onValueChange={(value) =>
                    patchFilters({
                      status: value === "all" ? undefined : (value as NonNullable<TaskFilters["status"]>),
                    })
                  }
                >
                  <SelectTrigger id="dashboard-filter-status" className="w-full">
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
                  htmlFor="dashboard-filter-category"
                >
                  Catégorie
                </label>
                <Select
                  value={filters.categoryId ?? "all"}
                  onValueChange={(value) =>
                    patchFilters({
                      categoryId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger id="dashboard-filter-category" className="w-full">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categoryOptions.map((category) => (
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
                  htmlFor="dashboard-filter-priority"
                >
                  Priorité
                </label>
                <Select
                  value={filters.priority ?? "all"}
                  onValueChange={(value) =>
                    patchFilters({
                      priority:
                        value === "all"
                          ? undefined
                          : (value as NonNullable<TaskFilters["priority"]>),
                    })
                  }
                >
                  <SelectTrigger id="dashboard-filter-priority" className="w-full">
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
        </CardContent>
      </Card>

      {/* Task View */}
      {viewMode === "calendar" ? (
        <TaskCalendar
          tasks={filteredTasks}
          onTaskClick={onEdit}
          onDateClick={(date) => {
            // Optional: Could filter by selected date
            console.log("Date clicked:", date);
          }}
        />
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {tasks.length === 0 ? "No tasks yet. Create one to get started!" : "No tasks match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}
