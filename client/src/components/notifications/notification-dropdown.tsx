"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { FeedbackState } from "@/components/ui/feedback-state";
import React from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationListSkeleton } from "@/components/ui/data-skeleton";
import { TaskForm } from "@/components/tasks/task-form";
import { useCategories } from "@/hooks/use-categories";
import { toTaskPayload } from "@/api/tasks";
import type { Task, TaskFormInput } from "@/schemas/task.schema";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useTasks } from "@/hooks/use-tasks";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  formatNotificationDate,
} from "@/utils/notification-utils";
import { taskPriorityColors, taskPriorityLabels } from "@/utils/task-utils";

const NOTIFICATION_TASKS_QUERY = {
  page: 1,
  pageSize: 100,
} as const;

export function NotificationDropdown() {
  const t = useTranslator();
  const tasksQuery = useTasks(NOTIFICATION_TASKS_QUERY);
  const showSkeleton = showQuerySkeleton(tasksQuery);
  const notifications = React.useMemo(
    () => getNotifications(tasksQuery.data?.items ?? []),
    [tasksQuery.data?.items],
  );
  const overdueCount = notifications.filter((n) => n.type === "overdue").length;
  const weekCount = notifications.filter(
    (n) => n.type === "due-this-week",
  ).length;
  const monthCount = notifications.filter(
    (n) => n.type === "due-this-month",
  ).length;

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const categories = useCategories();
  const updateTask = useUpdateTask();

  const handleTaskClick = (task: Task) => {
    setDropdownOpen(false);
    setEditingTask(task);
  };

  const handleSubmit = async (input: TaskFormInput) => {
    if (!editingTask) return;
    try {
      await updateTask.mutateAsync({
        id: editingTask.id,
        input: toTaskPayload(input),
      });
      toast.success(t("messages.taskUpdated2"));
      setEditingTask(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToUpdateTask")),
      );
    }
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Clock className="h-5 w-5" />
            {showSkeleton ? (
              <span
                className="absolute -top-1 -right-1 size-2 rounded-full bg-muted-foreground/50 animate-pulse"
                aria-hidden
              />
            ) : notifications.length > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>
              <Localized>
                <Localized>{"navigation.notifications"}</Localized>
              </Localized>
            </span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {notifications.length}{" "}
                {notifications.length === 1 ? "task" : "tasks"}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showSkeleton ? (
            <NotificationListSkeleton rows={4} />
          ) : notifications.length === 0 ? (
            <FeedbackState
              icon={Calendar}
              description={t("messages.noUpcomingTasks")}
            />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Overdue Tasks */}
              {overdueCount > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-destructive font-semibold flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <Localized>{"messages.overdue2"}</Localized>
                    {overdueCount})
                  </DropdownMenuLabel>
                  {notifications
                    .filter((n) => n.type === "overdue")
                    .map((notification) => (
                      <button
                        type="button"
                        key={notification.task.id}
                        className="w-full px-2 py-2 text-left hover:bg-accent rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => handleTaskClick(notification.task)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {notification.task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-xs font-medium text-white",
                                  taskPriorityColors[
                                    notification.task.priority
                                  ],
                                )}
                              >
                                <Localized>
                                  {
                                    taskPriorityLabels[
                                      notification.task.priority
                                    ]
                                  }
                                </Localized>
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationDate(
                                  notification.daysUntilDue,
                                  notification.type,
                                )}
                              </span>
                            </div>
                            {notification.task.deadline && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Localized>{"messages.due"}</Localized>
                                {formatDueDate(notification.task.deadline)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </DropdownMenuGroup>
              )}

              {/* Due This Week */}
              {weekCount > 0 && (
                <>
                  {overdueCount > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <Localized>{t("messages.thisWeek")}</Localized>
                      {weekCount})
                    </DropdownMenuLabel>
                    {notifications
                      .filter((n) => n.type === "due-this-week")
                      .map((notification) => (
                        <button
                          type="button"
                          key={notification.task.id}
                          className="w-full px-2 py-2 text-left hover:bg-accent rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleTaskClick(notification.task)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {notification.task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-xs font-medium text-white",
                                    taskPriorityColors[
                                      notification.task.priority
                                    ],
                                  )}
                                >
                                  <Localized>
                                    {
                                      taskPriorityLabels[
                                        notification.task.priority
                                      ]
                                    }
                                  </Localized>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatNotificationDate(
                                    notification.daysUntilDue,
                                    notification.type,
                                  )}
                                </span>
                              </div>
                              {notification.task.deadline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <Localized>{"messages.due"}</Localized>
                                  {formatDueDate(notification.task.deadline)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </DropdownMenuGroup>
                </>
              )}

              {/* Due This Month */}
              {monthCount > 0 && (
                <>
                  {(overdueCount > 0 || weekCount > 0) && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <Localized>{t("messages.thisMonth")}</Localized>
                      {monthCount})
                    </DropdownMenuLabel>
                    {notifications
                      .filter((n) => n.type === "due-this-month")
                      .slice(0, 5)
                      .map((notification) => (
                        <button
                          type="button"
                          key={notification.task.id}
                          className="w-full px-2 py-2 text-left hover:bg-accent rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => handleTaskClick(notification.task)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {notification.task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-xs font-medium text-white",
                                    taskPriorityColors[
                                      notification.task.priority
                                    ],
                                  )}
                                >
                                  <Localized>
                                    {
                                      taskPriorityLabels[
                                        notification.task.priority
                                      ]
                                    }
                                  </Localized>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatNotificationDate(
                                    notification.daysUntilDue,
                                    notification.type,
                                  )}
                                </span>
                              </div>
                              {notification.task.deadline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <Localized>{"messages.due"}</Localized>
                                  {formatDueDate(notification.task.deadline)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    {monthCount > 5 && (
                      <div className="px-2 py-2 text-xs text-center text-muted-foreground">
                        +{monthCount - 5}{" "}
                        <Localized>{"messages.moreTasksThisMonth"}</Localized>
                      </div>
                    )}
                  </DropdownMenuGroup>
                </>
              )}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <TaskForm
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        categories={categories.data ?? []}
        isSubmitting={updateTask.isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
}
