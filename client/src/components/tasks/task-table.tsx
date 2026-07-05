"use client";

import React from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  taskStatusLabels,
  taskPriorityLabels,
  taskCategoryLabels,
  taskPriorityColors,
  taskStatusColors,
} from "@/utils/task-utils";
import { Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskTableProps) {
  const handleStatusToggle = (task: Task) => {
    if (!onStatusChange) return;

    const statusOrder: Task["status"][] = ["todo", "in-process", "done", "complete"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(task.id, statusOrder[nextIndex]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                Description
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Priority
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                Category
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                Due Date
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {/* Status */}
                <td className="p-4 align-middle">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStatusToggle(task)}
                    aria-label="Toggle task status"
                  >
                    {task.status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>
                </td>

                {/* Title */}
                <td className="p-4 align-middle">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="flex items-center gap-2 md:hidden">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium text-white",
                          taskStatusColors[task.status]
                        )}
                      >
                        {taskStatusLabels[task.status]}
                      </span>
                    </div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground md:hidden line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>

                {/* Description */}
                <td className="p-4 align-middle hidden md:table-cell">
                  <div className="text-sm text-muted-foreground max-w-md truncate">
                    {task.description || "-"}
                  </div>
                </td>

                {/* Priority */}
                <td className="p-4 align-middle">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium text-white",
                      taskPriorityColors[task.priority]
                    )}
                  >
                    {taskPriorityLabels[task.priority]}
                  </span>
                </td>

                {/* Category */}
                <td className="p-4 align-middle hidden lg:table-cell">
                  <span className="text-sm">{taskCategoryLabels[task.category]}</span>
                </td>

                {/* Due Date */}
                <td className="p-4 align-middle hidden lg:table-cell">
                  <div className="text-sm">
                    {task.dueDate ? formatDate(task.dueDate) : "-"}
                  </div>
                </td>

                {/* Actions */}
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => onEdit?.(task)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete?.(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
