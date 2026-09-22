"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Task, TaskCategory, TaskFilters } from "@/types/task";
import {
  Plus,
  ClipboardList,
  Circle,
  Loader2,
  CheckCircle2,
  LineChart as LineChartIcon,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { taskStatusLabels, taskPriorityLabels } from "@/utils/task-utils";
import { tasksMock } from "@/mocks/tasks.mock";
import { MultiLineChart } from "@/components/charts/multi-line-chart";
import CardAnimation from "@/components/dashboard/card.animation";

const DashboardScreen = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [filters, setFilters] = React.useState<TaskFilters>({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [statusChartTimeRange, setStatusChartTimeRange] = React.useState<
    "7" | "30"
  >("30");
  const [statusChartType, setStatusChartType] = React.useState<"line" | "bar">(
    "line"
  );

  // Load tasks from localStorage on mount
  React.useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          toDoBefore: task.toDoBefore ? new Date(task.toDoBefore) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        setTasks(tasksMock);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  React.useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmitTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingTask) {
      // Update existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...taskData,
                updatedAt: new Date()
              }
            : task
        )
      );
      toast.success("Task updated successfully");
    } else {
      // Create new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.success("Task created successfully");
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    }
  };

  const handleStatusChange = (taskId: string, status: Task["status"]) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date(),
              completedAt: status === "complete" ? new Date() : undefined
            }
          : task
      )
    );
    toast.success("Task status updated");
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-process": tasks.filter((t) => t.status === "in-process").length,
      done: tasks.filter((t) => t.status === "done").length,
      complete: tasks.filter((t) => t.status === "complete").length
    };
    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
      urgent: tasks.filter((t) => t.priority === "urgent").length
    };
    return { total, byStatus, byPriority };
  }, [tasks]);

  // Prepare chart data
  const statusChartData = React.useMemo(() => {
    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)"
    ];
    return Object.entries(stats.byStatus)
      .map(([key, value], index) => ({
        label: taskStatusLabels[key as keyof typeof stats.byStatus],
        value,
        color: colors[index % colors.length]
      }))
      .filter((item) => item.value > 0);
  }, [stats.byStatus]);

  const priorityChartData = React.useMemo(() => {
    const colors = [
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)"
    ];
    return Object.entries(stats.byPriority)
      .map(([key, value], index) => ({
        label: taskPriorityLabels[key as keyof typeof stats.byPriority],
        value,
        color: colors[index % colors.length]
      }))
      .filter((item) => item.value > 0);
  }, [stats.byPriority]);

  // Prepare line chart data (tasks created over last 7 days)
  const lineChartData = React.useMemo(() => {
    const days = 7;
    const today = new Date();
    const data = Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - index));
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= date && taskDate < nextDate;
      }).length;

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        value: count
      };
    });
    return data;
  }, [tasks]);

  // Prepare status trends chart data
  const statusTrendsData = React.useMemo(() => {
    const days = statusChartTimeRange === "7" ? 7 : 30;
    const today = new Date();

    const generateDateLabels = () => {
      return Array.from({ length: days }, (_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - index));
        date.setHours(0, 0, 0, 0);
        return date;
      });
    };

    const dateLabels = generateDateLabels();

    const createSeriesData = (status: Task["status"]) => {
      return dateLabels.map((date) => {
        // Count tasks that have this status as of this date
        const count = tasks.filter((task) => {
          const createdDate = new Date(task.createdAt);
          createdDate.setHours(0, 0, 0, 0);

          // Task must be created on or before this date
          if (createdDate > date) return false;

          // For complete status: count tasks completed on or before this date
          if (status === "complete") {
            if (task.status !== "complete") return false;
            if (!task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate <= date;
          }

          // For other statuses: count tasks with this status that weren't completed before this date
          if (task.status !== status) return false;

          // If task is completed, it shouldn't be counted for non-complete statuses
          if (task.completedAt) {
            const completedDate = new Date(task.completedAt);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate > date;
          }

          return true;
        }).length;

        return {
          label: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }),
          value: count
        };
      });
    };

    const colors = [
      "var(--chart-1)", // To Do
      "var(--chart-2)", // In Process
      "var(--chart-3)" // Complete
    ];

    return [
      {
        name: "To Do",
        data: createSeriesData("todo"),
        color: colors[0]
      },
      {
        name: "In Process",
        data: createSeriesData("in-process"),
        color: colors[1]
      },
      {
        name: "Complete",
        data: createSeriesData("complete"),
        color: colors[2]
      }
    ];
  }, [tasks, statusChartTimeRange]);

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track your progress
            </p>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Total Tasks</CardDescription>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                100% of all tasks
              </p>
            </CardHeader>
          </Card>
          {/* <CardAnimation
            count={stats.total}
            title="Total Tasks"
            icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
            subtitle="100% of all tasks"
            link="/tasks"
          /> */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>To Do</CardDescription>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{stats.byStatus.todo}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0
                  ? Math.round((stats.byStatus.todo / stats.total) * 100)
                  : 0}
                % of total
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>In Process</CardDescription>
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              </div>
              <CardTitle className="text-3xl">
                {stats.byStatus["in-process"]}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0
                  ? Math.round(
                      (stats.byStatus["in-process"] / stats.total) * 100
                    )
                  : 0}
                % of total
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Complete</CardDescription>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">
                {stats.byStatus.complete}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0
                  ? Math.round((stats.byStatus.complete / stats.total) * 100)
                  : 0}
                % of total
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {statusChartData.length > 0 && (
            <PieChart
              data={statusChartData}
              title="Tasks by Status"
              description="Distribution of tasks by their current status"
            />
          )}
          {priorityChartData.length > 0 && (
            <PieChart
              data={priorityChartData}
              title="Tasks by Priority"
              description="Distribution of tasks by priority level"
            />
          )}
        </div>

        {/* Status Trends Chart */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Status Trends</CardTitle>
                <CardDescription>
                  Track tasks by status over time
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Chart Type Toggle */}
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={statusChartType === "line" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => setStatusChartType("line")}
                    aria-label="Line chart"
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={statusChartType === "bar" ? "default" : "ghost"}
                    size="sm"
                    className="h-8"
                    onClick={() => setStatusChartType("bar")}
                    aria-label="Bar chart"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Time Range Toggle */}
                <div className="flex items-center gap-1">
                  <Button
                    variant={
                      statusChartTimeRange === "7" ? "default" : "outline"
                    }
                    size="sm"
                    className="h-8"
                    onClick={() => setStatusChartTimeRange("7")}
                  >
                    7G
                  </Button>
                  <Button
                    variant={
                      statusChartTimeRange === "30" ? "default" : "outline"
                    }
                    size="sm"
                    className="h-8"
                    onClick={() => setStatusChartTimeRange("30")}
                  >
                    30G
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full">
            {statusChartType === "line" ? (
              <MultiLineChart
                series={statusTrendsData}
                title=""
                timeRange={statusChartTimeRange}
                onTimeRangeChange={setStatusChartTimeRange}
                className="border-0 shadow-none w-full"
              />
            ) : (
              <BarChart
                series={statusTrendsData}
                title=""
                timeRange={statusChartTimeRange}
                onTimeRangeChange={setStatusChartTimeRange}
                className="border-0 shadow-none w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />

        {/* Task Form */}
        <TaskForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          task={editingTask}
          onSubmit={handleSubmitTask}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardScreen;
