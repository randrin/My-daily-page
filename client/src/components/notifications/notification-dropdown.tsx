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
import { Task } from "@/types/task";
import { getNotifications, formatNotificationDate } from "@/utils/notification-utils";
import { taskPriorityColors, taskPriorityLabels } from "@/utils/task-utils";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  tasks?: Task[];
}

export function NotificationDropdown({ tasks: tasksProp }: NotificationDropdownProps) {
  const [tasks, setTasks] = React.useState<Task[]>(tasksProp || []);

  // Load tasks from localStorage if not provided
  React.useEffect(() => {
    if (tasksProp) {
      setTasks(tasksProp);
      return;
    }

    const loadTasks = () => {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          }));
          setTasks(parsedTasks);
        } catch (error) {
          console.error("Error loading tasks:", error);
        }
      }
    };

    loadTasks();
    
    // Listen for storage events to update when tasks change
    const handleStorageChange = () => {
      loadTasks();
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically (in case same window)
    const interval = setInterval(loadTasks, 2000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [tasksProp]);

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
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
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
        {notifications.length === 0 ? (
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
                          {notification.task.dueDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due: {formatDueDate(notification.task.dueDate)}
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
                            {notification.task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Due: {formatDueDate(notification.task.dueDate)}
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
                            {notification.task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Due: {formatDueDate(notification.task.dueDate)}
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
