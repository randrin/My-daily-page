"use client";
import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { TaskForm } from "@/components/tasks/task-form";
import { useTask, useUpdateTask } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { toTaskPayload } from "@/api/tasks";
import type { TaskFormInput } from "@/schemas/task.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Sparkles, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  assistantApi,
  suggestionSchema,
  confirmationSchema,
  type AssistantDraft,
  prioritySchema,
} from "@/api/assistant";
import { useMe } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { formatTravelPause, parseTravelPause } from "@/lib/travel-pause";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";

type Row = AssistantDraft["items"][number] & { day?: Date; time: string };
const priorities = {
  LOW: "messages.low",
  MEDIUM: "messages.medium",
  HIGH: "messages.high",
  URGENT: "messages.urgent",
};
export function AssistantScreen() {
  const { locale } = useLocale();
  const t = useTranslator();
  const cache = useQueryClient();
  const [editingId, setEditingId] = useState<string>();
  const detail = useTask(editingId ?? "");
  const categories = useCategories();
  const updateTask = useUpdateTask();
  async function saveTask(input: TaskFormInput) {
    if (!editingId) return;
    try {
      await updateTask.mutateAsync({
        id: editingId,
        input: toTaskPayload(input),
      });
      setEditingId(undefined);
      await cache.invalidateQueries({ queryKey: ["assistant"] });
      toast.success(t("messages.taskUpdated"));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToUpdateTask")),
      );
    }
  }
  const profile = useMe();
  const timezone = profile.data?.timezone ?? "Europe/Paris";
  const drafts = useQuery({
    queryKey: ["assistant", "drafts"],
    queryFn: assistantApi.drafts,
  });
  const brief = useQuery({
    queryKey: ["assistant", "brief"],
    queryFn: assistantApi.brief,
  });
  const review = useQuery({
    queryKey: ["assistant", "review"],
    queryFn: assistantApi.review,
  });
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"capture" | "breakdown">("capture");
  const [source, setSource] = useState<
    "manual" | "email" | "whatsapp" | "voice"
  >("manual");
  const [draftId, setDraftId] = useState<string>();
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minimum, setMinimum] = useState<Date>();
  const suggest = useMutation({ mutationFn: assistantApi.suggest });
  const confirm = useMutation({ mutationFn: assistantApi.confirm });
  function load(draft: AssistantDraft) {
    setDraftId(draft.id);
    setErrors({});
    setMinimum(
      new Date(
        new Date().toLocaleDateString("en-CA", { timeZone: timezone }) +
          "T00:00:00",
      ),
    );
    setRows(
      draft.items.map((item) => {
        const local = formatTravelPause(item.deadline, timezone);
        return {
          ...item,
          day: local ? new Date(local.slice(0, 10) + "T00:00:00") : undefined,
          time: local.slice(11) || "09:00",
        };
      }),
    );
  }
  function update(index: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    setErrors((current) => {
      const next = { ...current };
      if (patch.title !== undefined) {
        if (!patch.title.trim()) next[`${index}.title`] = "Le titre est requis";
        else delete next[`${index}.title`];
      }
      if ("day" in patch || "time" in patch) delete next[`${index}.deadline`];
      if (patch.selected !== undefined) delete next.tasks;
      return next;
    });
  }
  async function propose(provider: "guided" | "ai") {
    const parsed = suggestionSchema.safeParse({ text, mode, source, provider });
    if (!parsed.success) {
      setErrors({ text: parsed.error.issues[0].message });
      return;
    }
    try {
      load(await suggest.mutateAsync(parsed.data));
      void drafts.refetch();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSuggestTasks")),
      );
    }
  }
  async function create() {
    const selected = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.selected);
    const input = {
      selectedIndices: selected.map((item) => item.index),
      tasks: selected.map(({ row }) => ({
        title: row.title,
        priority: row.priority,
        deadline:
          parseTravelPause(
            `${row.day ? `${row.day.getFullYear()}-${String(row.day.getMonth() + 1).padStart(2, "0")}-${String(row.day.getDate()).padStart(2, "0")}` : ""}T${row.time}`,
            timezone,
          ) ?? "",
      })),
    };
    const parsed = confirmationSchema.safeParse(input);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const position = issue.path[1];
        next[
          typeof position === "number"
            ? `${selected[position].index}.${String(issue.path[2])}`
            : "tasks"
        ] =
          issue.path[2] === "deadline"
            ? "Choisis une date et une heure futures valides"
            : issue.message;
      }
      setErrors(next);
      return;
    }
    if (!draftId) return;
    try {
      const result = await confirm.mutateAsync({
        id: draftId,
        input: parsed.data,
      });
      toast.success(`${result.created} tâche(s) créée(s)`);
      setRows([]);
      setDraftId(undefined);
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["tasks"] }),
        cache.invalidateQueries({ queryKey: ["assistant"] }),
      ]);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToCreateTheseTasks")),
      );
    }
  }
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={Sparkles}>
          <Localized>
            <Localized>{"navigation.assistant"}</Localized>
          </Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.anIdeaSomeStepsThenYourApprovalNoTasks",
            )}
          </Localized>
        </p>
      </header>
      <section
        className="rounded-xl border bg-card p-5 space-y-4"
        aria-label={t("messages.capture")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <Localized>{"messages.source"}</Localized>
            <Select
              value={source}
              onValueChange={(value) =>
                setSource(suggestionSchema.shape.source.parse(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries({
                  manual: t("messages.anIdea"),
                  email: t("messages.pasteAnEmail"),
                  whatsapp: t("messages.pasteAWhatsappMessage"),
                  voice: t("messages.pasteAVoiceTranscript"),
                }).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <Localized>{label}</Localized>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2">
            <Localized>{t("messages.proposal")}</Localized>
            <Select
              value={mode}
              onValueChange={(value) =>
                setMode(suggestionSchema.shape.mode.parse(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="capture">
                  <Localized>{t("messages.oneTask")}</Localized>
                </SelectItem>
                <SelectItem value="breakdown">
                  <Localized>{t("messages.breakIntoSteps")}</Localized>
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <label
          htmlFor="assistant-text"
          className={errors.text ? "text-destructive" : ""}
        >
          <Localized>{t("messages.ideaOrMessageContent")}</Localized>
        </label>
        <Textarea
          id="assistant-text"
          value={text}
          maxLength={4000}
          placeholder={t(
            "messages.eGPrepareMyMoveSortBelongingsBookA",
          )}
          onChange={(event) => {
            setText(event.target.value);
            setErrors({});
          }}
          onBlur={() => {
            if (text && !text.trim())
              setErrors({ text: t("messages.describeYourTaskOrPasteAMessage") });
          }}
          aria-invalid={!!errors.text}
          aria-describedby="assistant-text-help"
        />
        {errors.text && (
          <p role="alert" className="text-sm text-destructive">
            {errors.text}
          </p>
        )}
        <p id="assistant-text-help" className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.guidedModeSplitsStepsByLineOrSemicolonAi",
            )}
          </Localized>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void propose("guided")}
            disabled={suggest.isPending}
          >
            <ListChecks /> <Localized>{t("messages.suggestWithoutAi")}</Localized>
          </Button>
          <Button
            onClick={() => void propose("ai")}
            disabled={suggest.isPending || !profile.data}
          >
            <Sparkles />{" "}
            {suggest.isPending ? t("messages.preparing") : "Proposer avec l’IA"}
          </Button>
        </div>
      </section>
      <section className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">
          <Localized>{t("messages.pendingProposals")}</Localized>
        </h2>
        {showQuerySkeleton(drafts) ? (
          <Skeleton className="h-14" />
        ) : drafts.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger les propositions"
          >
            <Button onClick={() => void drafts.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : !drafts.data?.length ? (
          <FeedbackState
            description={t("messages.proposalsForYouToReviewAppearHere")}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {drafts.data.map((draft) => (
              <Button
                key={draft.id}
                variant={draftId === draft.id ? "default" : "outline"}
                disabled={confirm.isPending}
                onClick={() => load(draft)}
              >
                {draft.items[0]?.title.slice(0, 50)} · {draft.items.length}
              </Button>
            ))}
          </div>
        )}
      </section>
      {draftId && (
        <section className="rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold">
            <Localized>{t("messages.reviewBeforeCreating")}</Localized>
          </h2>
          <p className="text-sm text-muted-foreground">
            <Localized>{t("messages.dueDatesRequired")}</Localized>
            {timezone}
            <Localized>
              {t(
                "messages.onlyCheckedStepsWillBeCreatedTheOthersStay",
              )}
            </Localized>
          </p>
          {rows.map((row, index) => (
            <article key={index} className="rounded-lg border p-4 space-y-3">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={row.selected}
                  disabled={confirm.isPending}
                  onChange={(event) =>
                    update(index, { selected: event.target.checked })
                  }
                />{" "}
                <Localized>{t("messages.includeThisTask")}</Localized>{" "}
                {row.deferred && (
                  <span className="text-muted-foreground text-sm">
                    <Localized>{t("messages.setAside")}</Localized>
                  </span>
                )}
              </label>
              <label
                htmlFor={`title-${index}`}
                className={errors[`${index}.title`] ? "text-destructive" : ""}
              >
                <Localized>{t("tasks.title")}</Localized>
              </label>
              <Input
                id={`title-${index}`}
                value={row.title}
                placeholder={t("messages.eGBookAVehicle")}
                disabled={confirm.isPending}
                onChange={(event) =>
                  update(index, { title: event.target.value })
                }
                aria-invalid={!!errors[`${index}.title`]}
              />
              {errors[`${index}.title`] && (
                <p role="alert" className="text-destructive text-sm">
                  {errors[`${index}.title`]}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{row.reason}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label
                    className={
                      errors[`${index}.deadline`] ? "text-destructive" : ""
                    }
                  >
                    <Localized>{t("tasks.dueDate")}</Localized>
                    <Popover
                      onOpenChange={(open) => {
                        if (open)
                          setMinimum(
                            new Date(
                              new Date().toLocaleDateString("en-CA", {
                                timeZone: timezone,
                              }) + "T00:00:00",
                            ),
                          );
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          disabled={confirm.isPending}
                          aria-invalid={!!errors[`${index}.deadline`]}
                        >
                          {row.day?.toLocaleDateString(
                            locale === "en" ? "en-US" : "fr-FR",
                          ) ?? t("messages.chooseADate")}
                          <CalendarDays />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          startMonth={minimum}
                          disabled={minimum ? { before: minimum } : undefined}
                          selected={row.day}
                          onSelect={(day) => update(index, { day })}
                        />
                      </PopoverContent>
                    </Popover>
                  </label>
                </div>
                <label>
                  <Localized>{t("messages.time")}</Localized>
                  <Input
                    type="time"
                    value={row.time}
                    disabled={confirm.isPending}
                    onChange={(event) =>
                      update(index, { time: event.target.value })
                    }
                  />
                </label>
                <label>
                  <Localized>{t("tasks.priority")}</Localized>
                  <Select
                    value={row.priority}
                    disabled={confirm.isPending}
                    onValueChange={(value) =>
                      update(index, { priority: prioritySchema.parse(value) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorities).map(([value, label]) => (
                        <SelectItem value={value} key={value}>
                          <Localized>{label}</Localized>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              {errors[`${index}.deadline`] && (
                <p role="alert" className="text-destructive text-sm">
                  {errors[`${index}.deadline`]}
                </p>
              )}
            </article>
          ))}
          {errors.tasks && (
            <p role="alert" className="text-destructive">
              {errors.tasks}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {brief.data?.reminderHint}
          </p>
          <Button
            onClick={() => void create()}
            disabled={confirm.isPending || !rows.some((row) => row.selected)}
          >
            {confirm.isPending
              ? t("messages.creating")
              : `Confirmer et créer les ${rows.filter((row) => row.selected).length} tâches`}
          </Button>
        </section>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold">
            <Localized>{t("messages.dailyBriefWhatWhyOrder")}</Localized>
          </h2>
          {showQuerySkeleton(brief) ? (
            <Skeleton className="h-28" />
          ) : brief.isError ? (
            <FeedbackState variant="error" description="Brief indisponible" />
          ) : !brief.data?.items.length ? (
            <FeedbackState
              description={t("messages.noTasksScheduledToday")}
            />
          ) : (
            brief.data.items.map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  className="font-medium underline"
                  onClick={() => setEditingId(item.id)}
                >
                  {item.order}. {item.title}
                </button>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))
          )}
          <p className="text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.theSameGuidanceAccompaniesYourMorningEmailSummaryWhen",
              )}
            </Localized>
          </p>
        </section>
        <section className="rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold">
            <Localized>{t("messages.weeklyReview")}</Localized>
          </h2>
          {showQuerySkeleton(review) ? (
            <Skeleton className="h-28" />
          ) : review.isError ? (
            <FeedbackState variant="error" description="Revue indisponible" />
          ) : (
            review.data && (
              <>
                <p>
                  {review.data.completed}{" "}
                  <Localized>{t("messages.completedIn7Days")}</Localized>{" "}
                  {review.data.overdue}{" "}
                  <Localized>{t("messages.overdue")}</Localized>
                  {review.data.blocked} <Localized>{t("messages.blocked")}</Localized>
                </p>
                {review.data.truncated && (
                  <p className="text-sm text-muted-foreground">
                    <Localized>
                      {t("messages.reviewLimitedToTheFirst200OpenTasks")}
                    </Localized>
                  </p>
                )}
                {!review.data.items.length ? (
                  <FeedbackState
                    description={t("messages.noOverdueOrBlockedTasksToReview")}
                  />
                ) : (
                  review.data.items.map((item) => (
                    <div key={item.id}>
                      <button
                        type="button"
                        className="font-medium underline"
                        onClick={() => setEditingId(item.id)}
                      >
                        {item.title}
                      </button>
                      <p className="text-sm text-muted-foreground">
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </>
            )
          )}
          <p className="text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.reviewOnSundayOrAtAnyTimeOpenA",
              )}
            </Localized>
          </p>
        </section>
      </div>
      {editingId && showQuerySkeleton(detail) && (
        <Skeleton className="h-16" aria-label={t("messages.loadingTask")} />
      )}
      {editingId && detail.isError && (
        <FeedbackState
          variant="error"
          description={t("messages.unableToLoadTask")}
        >
          <Button variant="outline" onClick={() => void detail.refetch()}>
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      )}
      <TaskForm
        open={Boolean(editingId && detail.data)}
        onOpenChange={(open) => {
          if (!open) setEditingId(undefined);
        }}
        task={detail.data ?? null}
        categories={categories.data ?? []}
        isSubmitting={updateTask.isPending}
        onSubmit={saveTask}
      />
    </div>
  );
}
