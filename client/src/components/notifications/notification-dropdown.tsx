"use client";

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
import { useTasks } from "@/hooks/use-tasks";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";
import { getNotifications, formatNotificationDate } from "@/utils/notification-utils";
import { taskPriorityColors, taskPriorityLabels } from "@/utils/task-utils";

const NOTIFICATION_TASKS_QUERY = {
  page: 1,
  pageSize: 100,
} as const;

export function NotificationDropdown() {
  const tasksQuery = useTasks(NOTIFICATION_TASKS_QUERY);
  const showSkeleton = showQuerySkeleton(tasksQuery);
  const tasks = tasksQuery.data?.items ?? [];
  const notifications = React.useMemo(() => getNotifications(tasks), [tasks]);
  const overdueCount = notifications.filter((n) => n.type === "overdue").length;
  const weekCount = notifications.filter((n) => n.type === "due-this-week").length;
  const monthCount = notifications.filter((n) => n.type === "due-this-month").length;

  const handleTaskClick = () => {
    // Close dropdown - user can find tasks on the dashboard
    // This is handled by the dropdown menu closing automatically
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <DropdownMenu>
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
          <span>Notifications</span>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {notifications.length} {notifications.length === 1 ? "task" : "tasks"}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showSkeleton ? (
          <NotificationListSkeleton rows={4} />
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No upcoming tasks</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {/* Overdue Tasks */}
            {overdueCount > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-destructive font-semibold flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Overdue ({overdueCount})
                </DropdownMenuLabel>
                {notifications
                  .filter((n) => n.type === "overdue")
                  .map((notification) => (
                    <div
                      key={notification.task.id}
                      className="px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={handleTaskClick}
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
                                taskPriorityColors[notification.task.priority]
                              )}
                            >
                              {taskPriorityLabels[notification.task.priority]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationDate(
                                notification.daysUntilDue,
                                notification.type
                              )}
                            </span>
                          </div>
                          {notification.task.deadline && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due: {formatDueDate(notification.task.deadline)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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
                    This Week ({weekCount})
                  </DropdownMenuLabel>
                  {notifications
                    .filter((n) => n.type === "due-this-week")
                    .map((notification) => (
                      <div
                        key={notification.task.id}
                        className="px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={handleTaskClick}
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
                                  taskPriorityColors[notification.task.priority]
                                )}
                              >
                                {taskPriorityLabels[notification.task.priority]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationDate(
                                  notification.daysUntilDue,
                                  notification.type
                                )}
                              </span>
                            </div>
                            {notification.task.deadline && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Due: {formatDueDate(notification.task.deadline)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </DropdownMenuGroup>
              </>
            )}

            {/* Due This Month */}
            {monthCount > 0 && (
              <>
                {(overdueCount > 0 || weekCount > 0) && <DropdownMenuSeparator />}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    This Month ({monthCount})
                  </DropdownMenuLabel>
                  {notifications
                    .filter((n) => n.type === "due-this-month")
                    .slice(0, 5)
                    .map((notification) => (
                      <div
                        key={notification.task.id}
                        className="px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={handleTaskClick}
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
                                  taskPriorityColors[notification.task.priority]
                              )}
                              >
                                {taskPriorityLabels[notification.task.priority]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationDate(
                                  notification.daysUntilDue,
                                  notification.type
                                )}
                              </span>
                            </div>
                            {notification.task.deadline && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Due: {formatDueDate(notification.task.deadline)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {monthCount > 5 && (
                    <div className="px-2 py-2 text-xs text-center text-muted-foreground">
                      +{monthCount - 5} more tasks this month
                    </div>
                  )}
                </DropdownMenuGroup>
              </>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
