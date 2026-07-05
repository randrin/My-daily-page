"use client";

import React from "react";
import { Task, TaskStatus, TaskPriority, TaskCategory } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
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
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  getAllCategories,
  getAllPriorities,
  getAllStatuses,
  taskCategoryLabels,
  taskPriorityLabels,
  taskStatusLabels
} from "@/utils/task-utils";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSubmit: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  onSubmit
}: TaskFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [category, setCategory] = React.useState<TaskCategory>("other");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [toDoBefore, setToDoBefore] = React.useState<Date | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setToDoBefore(task.toDoBefore ? new Date(task.toDoBefore) : undefined);
    } else {
      // Reset form for new task
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setCategory("other");
      setDueDate(undefined);
      setToDoBefore(undefined);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      category,
      dueDate: dueDate,
      toDoBefore: toDoBefore,
      completedAt: status === "complete" ? new Date() : undefined
    });

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{task ? "Edit Task" : "Create New Task"}</SheetTitle>
          <SheetDescription>
            {task
              ? "Update the task details below."
              : "Fill in the details to create a new task."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllStatuses().map((s) => (
                  <SelectItem key={s} value={s}>
                    {taskStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllPriorities().map((p) => (
                  <SelectItem key={p} value={p}>
                    {taskPriorityLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TaskCategory)}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllCategories().map((c) => (
                  <SelectItem key={c} value={c}>
                    {taskCategoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              className="rounded-md border"
            />
          </div>

          {/* To Do Before */}
          <div className="space-y-2">
            <Label>To Do Before</Label>
            <Calendar
              mode="single"
              selected={toDoBefore}
              onSelect={setToDoBefore}
              className="rounded-md border"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
