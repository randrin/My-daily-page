"use client";

import React from "react";
import type { DateRange } from "react-day-picker";
import { Task, TaskStatus, TaskPriority, TaskCategory } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { rangeToTaskDates, taskDatesToRange } from "@/lib/date-range";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { cn } from "@/lib/utils";
import { taskFormSchema } from "@/schemas/task.schema";
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

const taskFields = ["title"] as const;

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
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof taskFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setDateRange(taskDatesToRange(task.toDoBefore, task.dueDate));
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setCategory("other");
      setDateRange(undefined);
    }
    setFieldErrors({});
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { toDoBefore, dueDate } = rangeToTaskDates(dateRange);

    const parsed = taskFormSchema.safeParse({
      title,
      description: description.trim() || undefined,
      status,
      priority,
      category,
      dueDate,
      toDoBefore
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, taskFields));
      return;
    }

    setFieldErrors({});
    onSubmit({
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      category: parsed.data.category,
      dueDate: parsed.data.dueDate,
      toDoBefore: parsed.data.toDoBefore,
      completedAt: parsed.data.status === "complete" ? new Date() : undefined
    });

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
          </SheetTitle>
          <SheetDescription>
            {task
              ? "Ajuste les détails, puis enregistre."
              : "Titre, période et contexte. Le dashboard reste isolé à ton compte."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldErrors.title) || undefined}>
                <FieldLabel htmlFor="title">Titre</FieldLabel>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "title", e.target.value)
                    );
                  }}
                  placeholder="Préparer la page du jour"
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={
                    fieldErrors.title ? "title-error" : undefined
                  }
                />
                {fieldErrors.title ? (
                  <FieldError id="title-error">{fieldErrors.title}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes, contexte, livrable…"
                  rows={3}
                  className={cn(
                    "border-input placeholder:text-muted-foreground dark:bg-input/30 flex min-h-18 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="status">Statut</FieldLabel>
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
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">Priorité</FieldLabel>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as TaskPriority)
                    }
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
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="category">Catégorie</FieldLabel>
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
              </Field>

              <Field>
                <FieldLabel htmlFor="periode">Période</FieldLabel>
                <DateRangePicker
                  id="periode"
                  value={dateRange}
                  onChange={setDateRange}
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {task ? "Enregistrer" : "Créer la tâche"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
