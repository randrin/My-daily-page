"use client";

import { FeedbackState } from "@/components/ui/feedback-state";
import { reminderDeadline, deadlineTime } from "@/lib/reminder-deadline";
import React from "react";
import { TaskConflictWarning } from "@/components/tasks/task-conflict-warning";
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
import {
  defaultTaskDeadline,
  deadlineToRange,
  rangeToDeadline
} from "@/lib/date-range";
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
import { Check, Save, Undo2 } from "lucide-react";

const NONE_CATEGORY = "none";
const taskFields = ["title", "blockerIds", "deadline", "amount", "reference"] as const;

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
  const [recurrence, setRecurrence] = React.useState<"monthly" | "none">("none");
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState<"EUR" | "USD" | "XAF">("EUR");
  const [reference, setReference] = React.useState("");
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
  const [selectedTime, setSelectedTime] = React.useState("09:00");
  const deadlineInitialized = React.useRef(false);
  const initializedForm = React.useRef<string | null>(null);
  const profileQuery = useMe(open);
  const candidatesQuery = useTaskBlockerOptions(open);

  React.useEffect(() => {
    if (!open) {
      initializedForm.current = null;
      return;
    }
    const formKey = task?.id ?? "new";
    if (initializedForm.current === formKey) return;
    initializedForm.current = formKey;
    deadlineInitialized.current = Boolean(task || initialDeadline);
    setAmount(task?.amount ?? "");
    setCurrency(task?.currency ?? "EUR");
    setReference(task?.reference ?? "");
    setRecurrence(task?.recurrence === "monthly" ? "monthly" : "none");
    setSelectedTime(task?.deadline ? deadlineTime(task.deadline, profileQuery.data?.timezone ?? "Europe/Paris") : "09:00");
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategoryId(task.categoryId ?? NONE_CATEGORY);
      setDateRange(deadlineToRange(task.deadline));
      setBlockerIds(
        task.blockers
          ?.filter(
            (item) => item.status === "in-process" || item.status === "todo"
          )
          .map((item) => item.id) ??
          task.blockerIds ??
          []
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
    if (
      open &&
      !task &&
      !initialDeadline &&
      profileQuery.data &&
      !deadlineInitialized.current
    ) {
      deadlineInitialized.current = true;
      const deadline = defaultTaskDeadline(
        profileQuery.data.defaultDeadlineDays,
        new Date()
      );
      if (deadline)
        setDateRange((current) => current ?? deadlineToRange(deadline));
    }
  }, [open, task, initialDeadline, profileQuery.data]);

  const candidates = React.useMemo(() => {
    const items =
      candidatesQuery.data?.items.filter(
        (item) => item.status === "in-process" || item.status === "todo"
      ) ?? [];
    const extras = (task?.blockers ?? []).filter(
      (blocker) =>
        (blocker.status === "in-process" || blocker.status === "todo") &&
        !items.some((item) => item.id === blocker.id)
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

  const isReadOnly = task?.status === "archived";
  const fieldsDisabled = isReadOnly || Boolean(isSubmitting);

  const selectedDeadline = reminderDeadline(rangeToDeadline(dateRange), selectedTime, profileQuery.data?.timezone ?? "Europe/Paris");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const parsed = (task ? taskFormSchema : createTaskFormSchema).safeParse({
      recurrence: recurrence === "monthly" ? "monthly" : null,
      title,
      amount: amount.trim() ? amount.trim().replace(",", ".") : null,
      currency,
      reference: reference.trim() || null,
      description: normalizeRichText(description) || undefined,
      status,
      priority,
      categoryId: categoryId === NONE_CATEGORY ? undefined : categoryId,
      deadline: selectedDeadline,
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
      <SheetContent
        className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (
            document.querySelector(
              '[data-slot="popover-content"], [data-slot="select-content"]'
            )
          ) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          const target = event.target;
          if (
            target instanceof Element &&
            target.closest(
              '[data-slot="popover-content"], [data-slot="select-content"]'
            )
          ) {
            event.preventDefault();
          }
        }}
      >
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
                  disabled={fieldsDisabled}
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
                  disabled={fieldsDisabled}
                />
              </Field>

              <TaskImageField
                value={imageUrl}
                fileId={imageFileId}
                disabled={fieldsDisabled}
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
                    disabled={!task || fieldsDisabled}
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

                <Field data-invalid={Boolean(fieldErrors.amount)}>
                  <FieldLabel htmlFor="task-amount">Montant (facultatif)</FieldLabel>
                  <Input id="task-amount" inputMode="decimal" value={amount} disabled={fieldsDisabled} aria-invalid={Boolean(fieldErrors.amount)} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" />
                  {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="task-currency">Devise</FieldLabel>
                  <Select value={currency} disabled={fieldsDisabled} onValueChange={(next) => setCurrency(next as typeof currency)}><SelectTrigger id="task-currency"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="USD">USD — Dollar</SelectItem><SelectItem value="XAF">XAF — Franc CFA</SelectItem></SelectContent></Select>
                </Field>
                <Field data-invalid={Boolean(fieldErrors.reference)}>
                  <FieldLabel htmlFor="task-reference">Référence (facultatif)</FieldLabel>
                  <Input id="task-reference" value={reference} maxLength={120} disabled={fieldsDisabled} onChange={(event) => setReference(event.target.value)} />
                  {fieldErrors.reference && <FieldError>{fieldErrors.reference}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">Priorité</FieldLabel>
                  <Select
                    disabled={fieldsDisabled}
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
                <Select value={categoryId} onValueChange={setCategoryId} disabled={fieldsDisabled}>
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
                    disabled={fieldsDisabled}
                    value={blockerQuery}
                    onChange={(e) => setBlockerQuery(e.target.value)}
                    placeholder="Rechercher une tâche…"
                  />
                  {candidatesQuery.isPending ? (
                    <p className="text-xs text-muted-foreground">
                      Chargement des tâches…
                    </p>
                  ) : candidates.length === 0 ? (
                    <FeedbackState description="Aucune autre tâche. Crée-en une d’abord pour l’utiliser comme bloqueuse." />
                  ) : (
                    <ul className="max-h-48 overflow-y-auto rounded-md border">
                      {filteredCandidates.map((item) => {
                        const selected = blockerIds.includes(item.id);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              disabled={fieldsDisabled}
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
                  disabled={fieldsDisabled}
                  disablePast
                  value={dateRange}
                  invalid={Boolean(fieldErrors.deadline)}
                  onChange={(range) => {
                    deadlineInitialized.current = true;
                    setDateRange(range);
                    if (range?.from)
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "deadline")
                      );
                  }}
                  placeholder="Date d’échéance"
                />
                <FieldLabel htmlFor="deadline-time">Heure d’échéance ({profileQuery.data?.timezone ?? "Europe/Paris"})</FieldLabel>
                <Input id="deadline-time" type="time" value={selectedTime} disabled={fieldsDisabled}
                  onChange={(event) => setSelectedTime(event.target.value)} />
                {fieldErrors.deadline ? (
                  <FieldError>{fieldErrors.deadline}</FieldError>
                ) : null}
                {open && selectedDeadline && !isReadOnly && status !== "done" && status !== "archived" && <TaskConflictWarning deadline={selectedDeadline} excludeId={task?.id} />}
              </Field>
              <Field>
                <FieldLabel htmlFor="recurrence">Répétition</FieldLabel>
                <Select value={recurrence} disabled={fieldsDisabled} onValueChange={value => setRecurrence(value as "monthly" | "none")}>
                  <SelectTrigger id="recurrence"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Ne pas répéter</SelectItem><SelectItem value="monthly">Tous les mois</SelectItem></SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Une fois terminée, la prochaine occurrence sera créée automatiquement, à la même heure. Les notes et pièces jointes restent sur cette occurrence.</p>
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
              <Undo2 className="size-4 mr-2" />
              {isReadOnly ? "Fermer" : "Annuler"}
            </Button>
            <Button type="submit" disabled={fieldsDisabled || imageBusy}>
              <Save className="size-4 mr-2" />
              {isSubmitting || imageBusy
                ? "Enregistrement…"
                : task
                ? "Enregistrer"
                : "Créer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
