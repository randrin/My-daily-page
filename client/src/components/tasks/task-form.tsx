"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useTaskDefaults } from "@/hooks/use-personalization";

import { FeedbackState } from "@/components/ui/feedback-state";
import { reminderDeadline, deadlineTime } from "@/lib/reminder-deadline";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { useQuery } from "@tanstack/react-query";
import { personalizationApi } from "@/api/personalization";
import { TaskConflictWarning } from "@/components/tasks/task-conflict-warning";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { useTaskBlockerOptions } from "@/hooks/use-tasks";
import { useMe } from "@/hooks/use-profile";
import {
  defaultTaskDeadline,
  deadlineToRange,
  rangeToDeadline,
} from "@/lib/date-range";
import {
  omitFieldError,
  requiredFieldError,
  zodFieldErrors,
} from "@/lib/field-errors";
import { cn } from "@/lib/utils";
import {
  taskFormSchema,
  createTaskFormSchema,
  type Task,
  type TaskFormInput,
  type TaskPriority,
  type TaskStatus,
} from "@/schemas/task.schema";
import type { Category } from "@/schemas/category.schema";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskImageField } from "@/components/tasks/task-image-field";
import {
  canMarkTaskComplete,
  getAllPriorities,
  getAllStatuses,
} from "@/utils/task-utils";
import { firstLetterUppercase } from "@/utils";
import { normalizeRichText } from "@/lib/rich-text/html";
import { Check, Save, Undo2 } from "lucide-react";

const NONE_CATEGORY = "none";
const taskFields = [
  "title",
  "blockerIds",
  "deadline",
  "amount",
  "reference",
] as const;

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
  onSubmit,
}: TaskFormProps) {
  const t = useTranslator();
  const [recurrence, setRecurrence] = React.useState<"monthly" | "none">(
    "none",
  );
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
  const initializedForm = React.useRef<string | null>(null);
  const profileQuery = useMe(open);
  const defaultsQuery = useTaskDefaults(open);
  const energyQuery = useQuery({
    queryKey: ["personalization", "energy"],
    queryFn: personalizationApi.energy,
    enabled: open,
    retry: false,
  });
  const candidatesQuery = useTaskBlockerOptions(open);

  React.useEffect(() => {
    if (!open) {
      initializedForm.current = null;
      return;
    }
    if (profileQuery.isPending || (!task && defaultsQuery.isPending)) return;
    const formKey = task?.id ?? "new";
    if (initializedForm.current === formKey) return;
    const frame = requestAnimationFrame(() => {
      initializedForm.current = formKey;
      setAmount(task?.amount ?? "");
      setCurrency(task?.currency ?? "EUR");
      setReference(task?.reference ?? "");
      setRecurrence(task?.recurrence === "monthly" ? "monthly" : "none");
      setSelectedTime(
        task?.deadline
          ? deadlineTime(
              task.deadline,
              profileQuery.data?.timezone ?? "Europe/Paris",
            )
          : "09:00",
      );
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
              (item) => item.status === "in-process" || item.status === "todo",
            )
            .map((item) => item.id) ??
            task.blockerIds ??
            [],
        );
        setImageUrl(task.imageUrl ?? null);
        setImageFileId(null);
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority(defaultsQuery.data?.priority ?? "medium");
        setCategoryId(defaultsQuery.data?.categoryId ?? NONE_CATEGORY);
        setDateRange(
          deadlineToRange(
            initialDeadline ??
              defaultTaskDeadline(
                profileQuery.data?.defaultDeadlineDays,
                new Date(),
              ),
          ),
        );
        setBlockerIds([]);
        setImageUrl(null);
        setImageFileId(null);
      }
      setBlockerQuery("");
      setFieldErrors({});
    });
    return () => cancelAnimationFrame(frame);
  }, [
    profileQuery.isPending,
    profileQuery.data,
    task,
    open,
    initialDeadline,
    defaultsQuery.isPending,
    defaultsQuery.data,
  ]);

  const candidates = React.useMemo(() => {
    const items =
      candidatesQuery.data?.items.filter(
        (item) => item.status === "in-process" || item.status === "todo",
      ) ?? [];
    const extras = (task?.blockers ?? []).filter(
      (blocker) =>
        (blocker.status === "in-process" || blocker.status === "todo") &&
        !items.some((item) => item.id === blocker.id),
    );
    return [...extras, ...items].filter((item) => item.id !== task?.id);
  }, [candidatesQuery.data?.items, task]);

  const selectedBlockers = React.useMemo(
    () => candidates.filter((item) => blockerIds.includes(item.id)),
    [candidates, blockerIds],
  );

  const filteredCandidates = React.useMemo(() => {
    const query = blockerQuery.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }, [candidates, blockerQuery]);

  const hasUnresolvedBlockers = selectedBlockers.some(
    (item) => item.status === "in-process" || item.status === "todo",
  );

  const isReadOnly = task?.status === "archived";
  const fieldsDisabled =
    isReadOnly ||
    Boolean(isSubmitting) ||
    profileQuery.isPending ||
    (!task && defaultsQuery.isPending);

  const selectedDeadline = reminderDeadline(
    rangeToDeadline(dateRange),
    selectedTime,
    profileQuery.data?.timezone ?? "Europe/Paris",
  );

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
      categoryId: categoryId === NONE_CATEGORY ? null : categoryId,
      deadline: selectedDeadline,
      blockerIds,
      imageUrl,
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
        blockerIds: t(
          "messages.completeBlockingTasksBeforeClosingThisOne2",
        ),
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
        next.length ? omitFieldError(errors, "blockerIds") : errors,
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
              '[data-slot="popover-content"], [data-slot="select-content"]',
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
              '[data-slot="popover-content"], [data-slot="select-content"]',
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>
            {task ? t("messages.editTask") : t("messages.newTask2")}
          </SheetTitle>
          <SheetDescription>
            {task
              ? t("messages.adjustTheDetailsThenSave")
              : t(
                  "messages.titleStatusCategoryAndDueDateTheTaskIs",
                )}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              {!task && showQuerySkeleton(defaultsQuery) && (
                <Skeleton
                  className="h-10 w-full"
                  aria-label={t("messages.loadingDefaults")}
                />
              )}
              <Field data-invalid={Boolean(fieldErrors.title) || undefined}>
                <FieldLabel htmlFor="title">
                  <Localized>{t("tasks.title")}</Localized>
                </FieldLabel>
                <Input
                  id="title"
                  disabled={fieldsDisabled}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "title", e.target.value),
                    );
                  }}
                  placeholder={t("messages.prepareTheDailyPage")}
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
                <FieldLabel htmlFor="description">
                  <Localized>
                    <Localized>{"tasks.description"}</Localized>
                  </Localized>
                </FieldLabel>
                <RichTextEditor
                  key={task?.id ?? "new"}
                  id="description"
                  value={description}
                  onChange={setDescription}
                  placeholder={t("messages.notesContextDeliverable")}
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
                  <FieldLabel htmlFor="status">
                    <Localized>{t("tasks.status")}</Localized>
                  </FieldLabel>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value as TaskStatus);
                      if (value !== "blocked") {
                        setBlockerIds([]);
                        setBlockerQuery("");
                        setFieldErrors((errors) =>
                          omitFieldError(errors, "blockerIds"),
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
                      <Localized>
                        {t(
                          "messages.completeChildTasksBeforeMarkingThisTaskDoneOr",
                        )}
                      </Localized>
                    </p>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(fieldErrors.amount)}>
                  <FieldLabel htmlFor="task-amount">
                    <Localized>{t("messages.amountOptional")}</Localized>
                  </FieldLabel>
                  <Input
                    id="task-amount"
                    inputMode="decimal"
                    value={amount}
                    disabled={fieldsDisabled}
                    aria-invalid={Boolean(fieldErrors.amount)}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0,00"
                  />
                  {fieldErrors.amount && (
                    <FieldError>{fieldErrors.amount}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="task-currency">
                    <Localized>{t("messages.currency")}</Localized>
                  </FieldLabel>
                  <Select
                    value={currency}
                    disabled={fieldsDisabled}
                    onValueChange={(next) =>
                      setCurrency(next as typeof currency)
                    }
                  >
                    <SelectTrigger id="task-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">
                        <Localized>{"messages.eurEuro"}</Localized>
                      </SelectItem>
                      <SelectItem value="USD">
                        <Localized>{"messages.usdDollar"}</Localized>
                      </SelectItem>
                      <SelectItem value="XAF">
                        <Localized>{t("messages.xafCfaFranc")}</Localized>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field data-invalid={Boolean(fieldErrors.reference)}>
                  <FieldLabel htmlFor="task-reference">
                    <Localized>{t("messages.referenceOptional")}</Localized>
                  </FieldLabel>
                  <Input
                    id="task-reference"
                    value={reference}
                    maxLength={120}
                    disabled={fieldsDisabled}
                    onChange={(event) => setReference(event.target.value)}
                  />
                  {fieldErrors.reference && (
                    <FieldError>{fieldErrors.reference}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">
                    <Localized>{t("tasks.priority")}</Localized>
                  </FieldLabel>
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
                <FieldLabel htmlFor="category">
                  <Localized>{t("tasks.category")}</Localized>
                </FieldLabel>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={fieldsDisabled}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder={t("messages.none")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_CATEGORY}>
                      <Localized>{t("messages.none")}</Localized>
                    </SelectItem>
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
                    <Localized>{t("messages.blockingTasks")}</Localized>
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    <Localized>
                      {t(
                        "messages.childTasksMustBeCompletedBeforeClosingThisTask",
                      )}
                    </Localized>
                  </p>
                  <Input
                    id="blocker-search"
                    disabled={fieldsDisabled}
                    value={blockerQuery}
                    onChange={(e) => setBlockerQuery(e.target.value)}
                    placeholder={t("messages.searchTasks2")}
                  />
                  {candidatesQuery.isPending ? (
                    <p className="text-xs text-muted-foreground">
                      <Localized>{t("messages.loadingTasks")}</Localized>
                    </p>
                  ) : candidates.length === 0 ? (
                    <FeedbackState
                      description={t(
                        "messages.noOtherTasksCreateOneFirstToUseIt",
                      )}
                    />
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
                                selected && "bg-muted",
                              )}
                              aria-pressed={selected}
                            >
                              <span
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input",
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
                <FieldLabel htmlFor="deadline">
                  <Localized>{t("tasks.dueDate")}</Localized>
                </FieldLabel>
                <DateRangePicker
                  id="deadline"
                  disabled={fieldsDisabled}
                  disablePast
                  value={dateRange}
                  invalid={Boolean(fieldErrors.deadline)}
                  onChange={(range) => {
                    setDateRange(range);
                    if (range?.from)
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "deadline"),
                      );
                  }}
                  placeholder={t("messages.dueDate")}
                />
                <FieldLabel htmlFor="deadline-time">
                  <Localized>{t("messages.dueTime")}</Localized>
                  {profileQuery.data?.timezone ?? "Europe/Paris"})
                </FieldLabel>
                <Input
                  id="deadline-time"
                  type="time"
                  value={selectedTime}
                  disabled={fieldsDisabled}
                  onChange={(event) => setSelectedTime(event.target.value)}
                />
                {!task && showQuerySkeleton(energyQuery) && (
                  <Skeleton
                    className="h-9 w-48"
                    aria-label={t("messages.loadingSuggestedTimes")}
                  />
                )}
                {!task && !!energyQuery.data?.suggestions.length && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <Localized>
                        {t(
                          "messages.suggestedTimesBasedOnRecentCompletionsInYourTime",
                        )}
                      </Localized>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {energyQuery.data.suggestions.map((slot) => (
                        <Button
                          key={slot.hour}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={fieldsDisabled}
                          onClick={() =>
                            setSelectedTime(
                              `${String(slot.hour).padStart(2, "0")}:00`,
                            )
                          }
                        >
                          {String(slot.hour).padStart(2, "0")}:00 · {slot.count}{" "}
                          <Localized>{t("messages.completionS")}</Localized>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {fieldErrors.deadline ? (
                  <FieldError>{fieldErrors.deadline}</FieldError>
                ) : null}
                {open &&
                  selectedDeadline &&
                  !isReadOnly &&
                  status !== "done" &&
                  status !== "archived" && (
                    <TaskConflictWarning
                      deadline={selectedDeadline}
                      excludeId={task?.id}
                    />
                  )}
              </Field>
              <Field>
                <FieldLabel htmlFor="recurrence">
                  <Localized>{t("messages.repeat")}</Localized>
                </FieldLabel>
                <Select
                  value={recurrence}
                  disabled={fieldsDisabled}
                  onValueChange={(value) =>
                    setRecurrence(value as "monthly" | "none")
                  }
                >
                  <SelectTrigger id="recurrence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <Localized>{t("messages.doNotRepeat")}</Localized>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <Localized>{t("messages.everyMonth")}</Localized>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  <Localized>
                    {t(
                      "messages.completingThisTaskAutomaticallyCreatesTheNextOccurrenceAt",
                    )}
                  </Localized>
                </p>
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
              {isReadOnly ? t("common.close") : t("common.cancel")}
            </Button>
            <Button type="submit" disabled={fieldsDisabled || imageBusy}>
              <Save className="size-4 mr-2" />
              {isSubmitting || imageBusy
                ? "Enregistrement…"
                : task
                  ? t("common.save")
                  : t("messages.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
