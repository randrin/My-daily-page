"use client";

import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  ClipboardList,
  Info,
  LineChart as LineChartIcon,
  Loader2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { toTaskPayload } from "@/api/tasks";
import { BarChart } from "@/components/charts/bar-chart";
import { MultiLineChart } from "@/components/charts/multi-line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTask,
  useDeleteTask,
  useTasksInRange,
  useUpdateTask
} from "@/hooks/use-tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";
import {
  calendarDateToLocalDate,
  rangeToIsoBounds,
  upcomingPeriodRange,
  type DashboardPeriodPreset
} from "@/lib/date-range";
import type { TaskFormInput } from "@/schemas/task.schema";
import { Task, TaskFilters } from "@/types/task";
import { tasksByCategoryChartData } from "@/utils/category-utils";
import {
  canMarkTaskComplete,
  TASK_CANNOT_COMPLETE_WHILE_BLOCKED,
  taskPriorityLabels,
  taskStatusLabels,
} from "@/utils/task-utils";

type DashboardScreenProps = {
  defaultFrom: string;
  defaultTo: string;
};

const PERIOD_OPTIONS: { value: DashboardPeriodPreset; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "1m", label: "1 Mois" },
  { value: "2m", label: "2 Mois" },
  { value: "3m", label: "3 Mois" },
  { value: "custom", label: "Autres" }
];

type PeriodFilterControlsProps = {
  preset: DashboardPeriodPreset;
  onPresetChange: (value: DashboardPeriodPreset) => void;
  range?: DateRange;
  onCustomRangeChange: (next?: DateRange) => void;
  triggerClassName?: string;
  contentAlign?: "start" | "center" | "end";
};

function PeriodFilterControls({
  preset,
  onPresetChange,
  range,
  onCustomRangeChange,
  triggerClassName,
  contentAlign
}: PeriodFilterControlsProps) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Select
        value={preset}
        onValueChange={(value) =>
          onPresetChange(value as DashboardPeriodPreset)
        }
      >
        <SelectTrigger
          className={cn("w-full sm:w-40", triggerClassName)}
          aria-label="Période"
        >
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent position="popper" align={contentAlign}>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {preset === "custom" ? (
        <div className="w-full sm:w-[280px]">
          <DateRangePicker
            value={range}
            onChange={onCustomRangeChange}
            placeholder="Choisir une période"
          />
        </div>
      ) : null}
    </div>
  );
}

function periodLabel(range?: DateRange) {
  if (!range?.from) {
    return "Les données affichées concernent les tâches dont l’échéance est du — au —.";
  }
  const from = format(range.from, "d MMMM yyyy", { locale: fr });
  const to = format(range.to ?? range.from, "d MMMM yyyy", { locale: fr });
  return `Les données affichées concernent les tâches dont l’échéance est du ${from} au ${to}.`;
}

const DashboardScreen = ({ defaultFrom, defaultTo }: DashboardScreenProps) => {
  const { data: categories = [] } = useCategories();
  const [preset, setPreset] = React.useState<DashboardPeriodPreset>("7d");
  const [range, setRange] = React.useState<DateRange | undefined>(() => ({
    from: calendarDateToLocalDate(defaultFrom),
    to: calendarDateToLocalDate(defaultTo)
  }));
  const [filters, setFilters] = React.useState<TaskFilters>({});
  const [creationDeadline, setCreationDeadline] = React.useState<Date>();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [statusChartTimeRange, setStatusChartTimeRange] = React.useState<
    "7" | "30"
  >("30");
  const [statusChartType, setStatusChartType] = React.useState<"line" | "bar">(
    "line"
  );
  const [periodInAlert, setPeriodInAlert] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const target = headerRef.current;
    if (!target) return;

    const root = target.closest("[data-slot='dashboard-scroller']");
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPeriodInAlert(!entry.isIntersecting);
      },
      { root: root instanceof Element ? root : null, threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const bounds = rangeToIsoBounds(range);
  const rangeQuery = useTasksInRange({
    from: bounds.from,
    to: bounds.to
  });
  const { data, isError, refetch } = rangeQuery;
  const showSkeleton = showQuerySkeleton(rangeQuery);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = data?.items ?? [];
  const isSaving = createTask.isPending || updateTask.isPending;

  const handleCreateTask = () => {
    setCreationDeadline(undefined);
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmitTask = async (input: TaskFormInput) => {
    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          input: toTaskPayload(input)
        });
        toast.success("Tâche mise à jour");
      } else {
        await createTask.mutateAsync(toTaskPayload(input));
        toast.success("Tâche créée");
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la tâche")
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Tâche supprimée");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de supprimer la tâche")
      );
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
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

  const handlePresetChange = (value: DashboardPeriodPreset) => {
    setPreset(value);
    if (value !== "custom") {
      setRange(upcomingPeriodRange(new Date(), value));
    }
  };

  const handleCustomRangeChange = (next?: DateRange) => {
    if (!next?.from) return;
    setRange({ from: next.from, to: next.to ?? next.from });
  };

  const alertText = periodLabel(range);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-process": tasks.filter((t) => t.status === "in-process").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      done: tasks.filter((t) => t.status === "done").length,
      archived: tasks.filter((t) => t.status === "archived").length
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

  const categoryChartData = React.useMemo(
    () => tasksByCategoryChartData(tasks, categories),
    [tasks, categories]
  );

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

          if (status === "archived") {
            return task.status === "archived";
          }

          if (task.status !== status) return false;

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
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)"
    ];

    return [
      {
        name: taskStatusLabels.todo,
        data: createSeriesData("todo"),
        color: colors[0]
      },
      {
        name: taskStatusLabels["in-process"],
        data: createSeriesData("in-process"),
        color: colors[1]
      },
      {
        name: taskStatusLabels.done,
        data: createSeriesData("done"),
        color: colors[2]
      },
      {
        name: taskStatusLabels.archived,
        data: createSeriesData("archived"),
        color: colors[3]
      }
    ];
  }, [tasks, statusChartTimeRange]);

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">
              Manage your tasks and track your progress
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!periodInAlert ? (
              <PeriodFilterControls
                preset={preset}
                onPresetChange={handlePresetChange}
                range={range}
                onCustomRangeChange={handleCustomRangeChange}
              />
            ) : null}
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="sticky top-0 z-20 -mx-4 bg-background px-4 py-2">
          <Alert
            variant="info"
            className="items-center has-[>svg]:grid-cols-[1rem_minmax(0,1fr)]"
          >
            <Info />
            <div
              className={cn(
                "col-start-2 flex min-w-0",
                periodInAlert &&
                  "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              )}
            >
              <div className="min-w-0">
                <AlertTitle className="col-start-auto">
                  Période des données
                </AlertTitle>
                <AlertDescription className="col-start-auto">
                  {alertText}
                </AlertDescription>
              </div>
              {periodInAlert ? (
                <PeriodFilterControls
                  preset={preset}
                  onPresetChange={handlePresetChange}
                  range={range}
                  onCustomRangeChange={handleCustomRangeChange}
                  triggerClassName="bg-background"
                  contentAlign="end"
                />
              ) : null}
            </div>
          </Alert>
        </div>

        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Impossible de charger les tâches</AlertTitle>
            <AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {showSkeleton ? (
          <div
            aria-busy="true"
            aria-live="polite"
            data-slot="dashboard-loading"
          >
            <DashboardSkeleton />
          </div>
        ) : null}

        {!showSkeleton && !isError ? (
          <>
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
                  <CardTitle className="text-3xl">
                    {stats.byStatus.todo}
                  </CardTitle>
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
                    <CardDescription>Terminées</CardDescription>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl">
                    {stats.byStatus.archived}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0
                      ? Math.round(
                          (stats.byStatus.archived / stats.total) * 100
                        )
                      : 0}
                    % of total
                  </p>
                </CardHeader>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              {categoryChartData.length > 0 && (
                <PieChart
                  data={categoryChartData}
                  title="Tasks by Categories"
                  description="Distribution of tasks by category"
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
                        variant={
                          statusChartType === "line" ? "default" : "ghost"
                        }
                        size="sm"
                        className="h-8"
                        onClick={() => setStatusChartType("line")}
                        aria-label="Line chart"
                      >
                        <LineChartIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={
                          statusChartType === "bar" ? "default" : "ghost"
                        }
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
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
              onCreateAtDate={(date) => {
                setCreationDeadline(date);
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </>
        ) : null}

        {/* Task Form */}
        <TaskForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          task={editingTask}
          initialDeadline={creationDeadline}
          categories={categories}
          isSubmitting={isSaving}
          onSubmit={handleSubmitTask}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardScreen;
