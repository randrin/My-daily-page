"use client";

import React from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  taskStatusLabels, 
  taskPriorityLabels,
  taskCategoryLabels,
  taskPriorityColors,
  taskStatusColors 
} from "@/utils/task-utils";
import { Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const handleStatusToggle = () => {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleStatusToggle}
            aria-label="Toggle task status"
          >
            {task.status === "complete" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium text-white",
                taskStatusColors[task.status]
              )}
            >
              {taskStatusLabels[task.status]}
            </span>
            <span
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium text-white",
                taskPriorityColors[task.priority]
              )}
            >
              {taskPriorityLabels[task.priority]}
            </span>
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              {taskCategoryLabels[task.category]}
            </span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due: {formatDate(task.dueDate)}
            </div>
          )}

          {/* To Do Before */}
          {task.toDoBefore && (
            <div className="text-xs text-muted-foreground">
              To Do Before: {formatDate(task.toDoBefore)}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => onEdit?.(task)}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
