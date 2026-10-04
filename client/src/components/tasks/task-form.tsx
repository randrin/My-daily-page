"use client";

import React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { useTaskBlockerOptions } from "@/hooks/use-tasks";
import { useMe } from "@/hooks/use-profile";
import { defaultTaskDeadline, deadlineToRange, rangeToDeadline } from "@/lib/date-range";
import {
  omitFieldError,
  requiredFieldError,
  zodFieldErrors
} from "@/lib/field-errors";
import { cn } from "@/lib/utils";
import {
  taskFormSchema,
  createTaskFormSchema,
  type Task,
  type TaskFormInput,
  type TaskPriority,
  type TaskStatus
} from "@/schemas/task.schema";
import type { Category } from "@/schemas/category.schema";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskImageField } from "@/components/tasks/task-image-field";
import {
  canMarkTaskComplete,
  getAllPriorities,
  getAllStatuses
} from "@/utils/task-utils";
import { firstLetterUppercase } from "@/utils";
import { normalizeRichText } from "@/lib/rich-text/html";
import { Check } from "lucide-react";

const NONE_CATEGORY = "none";
const taskFields = ["title", "blockerIds", "deadline"] as const;

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
  initialDeadline?: Date;
  categories: Category[];
  isSubmitting?: boolean;
  onSubmit: (input: TaskFormInput) => Promise<void> | void;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  initialDeadline,
  categories,
  isSubmitting,
  onSubmit
}: TaskFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [categoryId, setCategoryId] = React.useState(NONE_CATEGORY);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [blockerIds, setBlockerIds] = React.useState<string[]>([]);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageFileId, setImageFileId] = React.useState<string | null>(null);
  const [imageBusy, setImageBusy] = React.useState(false);
  const [blockerQuery, setBlockerQuery] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof taskFields)[number], string>>
  >({});
  const deadlineInitialized = React.useRef(false);
  const profileQuery = useMe(open && !task);
  const candidatesQuery = useTaskBlockerOptions(open);

  React.useEffect(() => {
    deadlineInitialized.current = Boolean(task || initialDeadline);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategoryId(task.categoryId ?? NONE_CATEGORY);
      setDateRange(deadlineToRange(task.deadline));
      setBlockerIds(
        task.blockers?.filter((item) => (item.status === "in-process" || item.status === "todo")).map((item) => item.id) ?? task.blockerIds ?? []
      );
      setImageUrl(task.imageUrl ?? null);
      setImageFileId(null);
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setCategoryId(NONE_CATEGORY);
      setDateRange(deadlineToRange(initialDeadline));
      setBlockerIds([]);
      setImageUrl(null);
      setImageFileId(null);
    }
    setBlockerQuery("");
    setFieldErrors({});
  }, [task, open, initialDeadline]);

  React.useEffect(() => {
    if (open && !task && !initialDeadline && profileQuery.data && !deadlineInitialized.current) {
      deadlineInitialized.current = true;
      const deadline = defaultTaskDeadline(profileQuery.data.defaultDeadlineDays, new Date());
      if (deadline) setDateRange((current) => current ?? deadlineToRange(deadline));
    }
  }, [open, task, initialDeadline, profileQuery.data]);

  const candidates = React.useMemo(() => {
    const items =
      candidatesQuery.data?.items.filter(
        (item) => item.status === "in-process" || item.status === "todo"
      ) ?? [];
    const extras = (task?.blockers ?? []).filter(
      (blocker) => (blocker.status === "in-process" || blocker.status === "todo") && !items.some((item) => item.id === blocker.id)
    );
    return [...extras, ...items].filter((item) => item.id !== task?.id);
  }, [candidatesQuery.data?.items, task]);

  const selectedBlockers = React.useMemo(
    () => candidates.filter((item) => blockerIds.includes(item.id)),
    [candidates, blockerIds]
  );

  const filteredCandidates = React.useMemo(() => {
    const query = blockerQuery.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((item) =>
      item.title.toLowerCase().includes(query)
    );
  }, [candidates, blockerQuery]);

  const hasUnresolvedBlockers = selectedBlockers.some(
    (item) => item.status === "in-process" || item.status === "todo"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = (task ? taskFormSchema : createTaskFormSchema).safeParse({
      title,
      description: normalizeRichText(description) || undefined,
      status,
      priority,
      categoryId: categoryId === NONE_CATEGORY ? undefined : categoryId,
      deadline: rangeToDeadline(dateRange),
      blockerIds,
      imageUrl
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, taskFields));
      return;
    }

    if (
      (status === "done" || status === "archived") &&
      !canMarkTaskComplete({ blockers: selectedBlockers })
    ) {
      setFieldErrors({
        blockerIds:
          "Termine d’abord les tâches qui bloquent avant de clôturer celle-ci"
      });
      return;
    }

    setFieldErrors({});
    await onSubmit(parsed.data);
  };

  const toggleBlocker = (id: string) => {
    setBlockerIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      setFieldErrors((errors) =>
        next.length ? omitFieldError(errors, "blockerIds") : errors
      );
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg">
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
                <RichTextEditor
                  key={task?.id ?? "new"}
                  id="description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Notes, contexte, livrable…"
                  disabled={isSubmitting}
                />
              </Field>

              <TaskImageField
                value={imageUrl}
                fileId={imageFileId}
                disabled={isSubmitting}
                onChange={(url, id) => {
                  setImageUrl(url);
                  setImageFileId(id);
                }}
                onBusyChange={setImageBusy}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="status">Statut</FieldLabel>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value as TaskStatus);
                      if (value !== "blocked") {
                        setBlockerIds([]);
                        setBlockerQuery("");
                        setFieldErrors((errors) =>
                          omitFieldError(errors, "blockerIds")
                        );
                      }
                    }}
                    disabled={!task || task.status === "archived"}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllStatuses().map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          disabled={
                            (item === "done" || item === "archived") &&
                            hasUnresolvedBlockers
                          }
                        >
                          <TaskStatusBadge status={item} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasUnresolvedBlockers ? (
                    <p className="text-xs text-muted-foreground">
                      Termine les tâches filles avant Terminée ou Archivée.
                    </p>
                  ) : null}
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

              {status === "blocked" ? (
                <Field
                  data-invalid={Boolean(fieldErrors.blockerIds) || undefined}
                >
                  <FieldLabel htmlFor="blocker-search">
                    Tâches qui bloquent
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Les tâches filles doivent être terminées avant de clôturer
                    celle-ci.
                  </p>
                  <Input
                    id="blocker-search"
                    value={blockerQuery}
                    onChange={(e) => setBlockerQuery(e.target.value)}
                    placeholder="Rechercher une tâche…"
                  />
                  {candidatesQuery.isPending ? (
                    <p className="text-xs text-muted-foreground">
                      Chargement des tâches…
                    </p>
                  ) : candidates.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucune autre tâche. Crée-en une d’abord pour l’utiliser
                      comme bloqueuse.
                    </p>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto rounded-md border">
                      {filteredCandidates.map((item) => {
                        const selected = blockerIds.includes(item.id);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => toggleBlocker(item.id)}
                              className={cn(
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                selected && "bg-muted"
                              )}
                              aria-pressed={selected}
                            >
                              <span
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input"
                                )}
                                aria-hidden
                              >
                                {selected ? <Check className="size-3" /> : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {item.title}
                              </span>
                              <TaskStatusBadge status={item.status} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {fieldErrors.blockerIds ? (
                    <FieldError id="blockerIds-error">
                      {fieldErrors.blockerIds}
                    </FieldError>
                  ) : null}
                </Field>
              ) : null}

              <Field data-invalid={Boolean(fieldErrors.deadline) || undefined}>
                <FieldLabel htmlFor="deadline">Échéance</FieldLabel>
                <DateRangePicker
                  id="deadline"
                  value={dateRange}
                  invalid={Boolean(fieldErrors.deadline)}
                  onChange={(range) => {
                    deadlineInitialized.current = true;
                    setDateRange(range);
                    if (range?.from) setFieldErrors((errors) => omitFieldError(errors, "deadline"));
                  }}
                  placeholder="Date d’échéance"
                />
                {fieldErrors.deadline ? <FieldError>{fieldErrors.deadline}</FieldError> : null}
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
            <Button type="submit" disabled={isSubmitting || imageBusy}>
              {isSubmitting || imageBusy
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
