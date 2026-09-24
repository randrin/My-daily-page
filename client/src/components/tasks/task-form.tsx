"use client";

import React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { deadlineToRange, rangeToDeadline } from "@/lib/date-range";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { cn } from "@/lib/utils";
import {
  taskFormSchema,
  type Task,
  type TaskFormInput,
  type TaskPriority,
  type TaskStatus,
} from "@/schemas/task.schema";
import type { Category } from "@/schemas/category.schema";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { getAllPriorities, getAllStatuses } from "@/utils/task-utils";
import { firstLetterUppercase } from "@/utils";

const NONE_CATEGORY = "none";
const taskFields = ["title"] as const;

function CategorySelectOption({ category }: { category: Category }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-full border"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <span className="truncate">{firstLetterUppercase(category.name)}</span>
    </span>
  );
}

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  categories: Category[];
  isSubmitting?: boolean;
  onSubmit: (input: TaskFormInput) => Promise<void> | void;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  categories,
  isSubmitting,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = React.useState(NONE_CATEGORY);
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
      setCategoryId(task.categoryId ?? NONE_CATEGORY);
      setDateRange(deadlineToRange(task.deadline));
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setCategoryId(NONE_CATEGORY);
      setDateRange(undefined);
    }
    setFieldErrors({});
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = taskFormSchema.safeParse({
      title,
      description: description.trim() || undefined,
      status,
      priority,
      categoryId: categoryId === NONE_CATEGORY ? undefined : categoryId,
      deadline: rangeToDeadline(dateRange),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, taskFields));
      return;
    }

    setFieldErrors({});
    await onSubmit(parsed.data);
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
              : "Titre, statut, catégorie et échéance. La tâche reste isolée à ton compte."}
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
                      requiredFieldError(errors, "title", e.target.value),
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
                    "disabled:cursor-not-allowed disabled:opacity-50",
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
                      {getAllStatuses().map((item) => (
                        <SelectItem key={item} value={item}>
                          <TaskStatusBadge status={item} />
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
                      {getAllPriorities().map((item) => (
                        <SelectItem key={item} value={item}>
                          <TaskPriorityBadge priority={item} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="category">Catégorie</FieldLabel>
                <Select
                  modal={false}
                  value={categoryId}
                  onValueChange={setCategoryId}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_CATEGORY}>Aucune</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <CategorySelectOption category={category} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="deadline">Échéance</FieldLabel>
                <DateRangePicker
                  id="deadline"
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Date d’échéance"
                />
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement…"
                : task
                  ? "Enregistrer"
                  : "Créer la tâche"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
