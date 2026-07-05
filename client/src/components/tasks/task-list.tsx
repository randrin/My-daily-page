"use client";

import React from "react";
import { Task, TaskFilters } from "@/types/task";
import { TaskCard } from "./task-card";
import { TaskTable } from "./task-table";
import { TaskCalendar } from "./task-calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getAllCategories, 
  getAllPriorities, 
  getAllStatuses,
  taskCategoryLabels,
  taskPriorityLabels,
  taskStatusLabels 
} from "@/utils/task-utils";
import { Search, X, Filter, LayoutGrid, List, Calendar1Icon, Calendar1 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";


interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
  filters?: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  filters = {},
  onFiltersChange,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || "");
  const [showFilters, setShowFilters] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : undefined
  );
  const [dateField, setDateField] = React.useState<"dueDate" | "createdAt" | "completedAt">(
    filters.dateRange?.field || "dueDate"
  );
  const [timeRange, setTimeRange] = React.useState<"7" | "30">("30");
  const [viewMode, setViewMode] = React.useState<"card" | "table" | "calendar">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskViewMode");
      return (saved === "card" || saved === "table" || saved === "calendar") ? saved : "card";
    }
    return "card";
  });

  // Save view mode preference
  React.useEffect(() => {
    localStorage.setItem("taskViewMode", viewMode);
  }, [viewMode]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange?.({ ...filters, search: value || undefined });
  };

  const toggleFilter = (
    type: "category" | "priority" | "status",
    value: string
  ) => {
    const currentFilters = filters[type] || [];
    const newFilters = currentFilters.includes(value as any)
      ? currentFilters.filter((f) => f !== value)
      : [...currentFilters, value as any];

    onFiltersChange?.({
      ...filters,
      [type]: newFilters.length > 0 ? newFilters : undefined,
    });
  };

  const handleDateRangeChange = (
    start: Date | undefined,
    end: Date | undefined,
    field: "dueDate" | "createdAt" | "completedAt"
  ) => {
    setStartDate(start);
    setEndDate(end);
    setDateField(field);
    
    const dateRange = start || end ? {
      startDate: start,
      endDate: end,
      field,
    } : undefined;

    onFiltersChange?.({
      ...filters,
      dateRange,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setDateField("dueDate");
    onFiltersChange?.({});
  };

  const hasActiveFilters = 
    filters.category?.length || 
    filters.priority?.length || 
    filters.status?.length || 
    filters.search ||
    filters.dateRange?.startDate ||
    filters.dateRange?.endDate;

  const filteredTasks = tasks.filter((task) => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category?.length && !filters.category.includes(task.category)) {
      return false;
    }
    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false;
    }
    
    // Time range filter (7G/30G)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const daysAgo = new Date(today);
    daysAgo.setDate(daysAgo.getDate() - (timeRange === "7" ? 7 : 30));
    daysAgo.setHours(0, 0, 0, 0);
    
    // Check if task has a date field that falls within the time range
    const taskDate = task.dueDate || task.toDoBefore || task.createdAt;
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
    
    // Date range filter
    if (filters.dateRange) {
      const { startDate, endDate, field } = filters.dateRange;
      let taskDate: Date | undefined;
      
      if (field === "dueDate") {
        taskDate = task.dueDate;
      } else if (field === "createdAt") {
        taskDate = task.createdAt;
      } else if (field === "completedAt") {
        taskDate = task.completedAt;
      }
      
      if (!taskDate) {
        // If filtering by a date field that doesn't exist, exclude the task
        return false;
      }
      
      // Normalize dates to start of day for comparison
      const taskDateOnly = new Date(taskDate);
      taskDateOnly.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (taskDateOnly < start) {
          return false;
        }
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (taskDateOnly > end) {
          return false;
        }
      }
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
                  onClick={() => setViewMode("card")}
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode("table")}
                  aria-label="Table view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode("calendar")}
                  aria-label="Calendar view"
                >
                  <Calendar1Icon className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
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

          {/* Filter Options */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {getAllStatuses().map((status) => (
                    <Button
                      key={status}
                      variant={filters.status?.includes(status) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("status", status)}
                    >
                      {taskStatusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {getAllPriorities().map((priority) => (
                    <Button
                      key={priority}
                      variant={filters.priority?.includes(priority) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("priority", priority)}
                    >
                      {taskPriorityLabels[priority]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {getAllCategories().map((category) => (
                    <Button
                      key={category}
                      variant={filters.category?.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("category", category)}
                    >
                      {taskCategoryLabels[category]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar1 className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="space-y-3">
                  {/* Date Field Selector */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Filter by</Label>
                    <Select
                      value={dateField}
                      onValueChange={(value) => handleDateRangeChange(startDate, endDate, value as "dueDate" | "createdAt" | "completedAt")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="completedAt">Completed Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Date Calendars */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateRangeChange(date, endDate, dateField)}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateRangeChange(startDate, date, dateField)}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
