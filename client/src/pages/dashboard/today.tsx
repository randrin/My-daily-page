"use client";

import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { Check, Clock, Plus, Sun, Target } from "lucide-react";
import { toast } from "sonner";
import { requireSession } from "@/auth/guards";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { TaskListTemplate } from "@/components/tasks/task-list-template";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTask,
  useTask,
  useTodayTasks,
  useUpdateTask,
} from "@/hooks/use-tasks";
import { toTaskPayload } from "@/api/tasks";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { useTasksUiStore } from "@/stores/tasks.store";
import { canMarkTaskComplete } from "@/utils/task-utils";
import type { TaskFormInput } from "@/schemas/task.schema";

export const getServerSideProps: GetServerSideProps = requireSession;

export default function TodayPage() {
  const { locale } = useLocale();
  const t = useTranslator();
  const query = useTodayTasks();
  const categories = useCategories();
  const create = useCreateTask();
  const update = useUpdateTask();
  const { isFormOpen, selectedTaskId, openCreate, openEdit, closeForm } =
    useTasksUiStore();
  const detail = useTask(selectedTaskId ?? "");
  const data = query.data;
  const pending = create.isPending || update.isPending;

  async function save(input: TaskFormInput) {
    try {
      if (selectedTaskId)
        await update.mutateAsync({
          id: selectedTaskId,
          input: toTaskPayload(input),
        });
      else await create.mutateAsync(toTaskPayload(input));
      closeForm();
      toast.success(selectedTaskId ? t("messages.taskUpdated") : t("messages.taskCreated"));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSaveTask")),
      );
    }
  }

  async function complete(id: string) {
    try {
      await update.mutateAsync({ id, input: { status: "done" } });
      toast.success(t("messages.oneLessTaskWellDone"));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToCompleteTask")),
      );
    }
  }

  return (
    <DashboardLayout>
      <main className="w-full space-y-6">
        <section className="space-y-4">
          <PageTitle icon={Sun}>
            <Localized>{t("messages.onePageOneDay")}</Localized>
          </PageTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.focusOnYourNextThreeTasksUrgentOnesFirst",
              )}
            </Localized>
          </p>
          {data && (
            <p className="mt-3 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
                dateStyle: "full",
                timeZone: "UTC",
              }).format(new Date(`${data.date}T12:00:00Z`))}{" "}
              · {data.timezone}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={openCreate}>
              <Plus aria-hidden />
              <Localized>{t("messages.newTask2")}</Localized>
            </Button>
            {data && <TaskListTemplate timezone={data.timezone} />}
            <Button variant="outline" asChild>
              <Link href="/dashboard/tasks">
                <Localized>{t("messages.allMyTasks")}</Localized>
              </Link>
            </Button>
          </div>
        </section>
        {showQuerySkeleton(query) ? (
          <div className="space-y-4" aria-label={t("messages.loadingYourDay")}>
            <Skeleton className="h-6 w-48" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : query.isError ? (
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadYourDay")}
          >
            <Button variant="outline" onClick={() => void query.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : (
          data && (
            <>
              <p className="text-sm text-muted-foreground">
                {data.completed} / {data.total}{" "}
                <Localized>{t("messages.tasksCompletedToday")}</Localized>
                {data.total - data.completed > 3
                  ? ` · ${data.total - data.completed} restantes, trois affichées`
                  : ""}
              </p>
              {!data.items.length ? (
                <FeedbackState
                  icon={Check}
                  title={
                    data.total
                      ? t("messages.yourDayIsUpToDate")
                      : t("messages.aDayToOrganize")
                  }
                  description={
                    data.total
                      ? t("messages.allTasksDueTodayAreComplete")
                      : t(
                          "messages.noTasksScheduledTodayAddOneOrViewUpcoming",
                        )
                  }
                />
              ) : (
                <div className="space-y-4">
                  {data.items.map((task, index) => (
                    <Card
                      key={task.id}
                      className={
                        index === 0
                          ? "border-amber-300/60 bg-gradient-to-br from-amber-50 via-background to-background dark:border-amber-800 dark:from-amber-950/30"
                          : ""
                      }
                    >
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {index === 0
                              ? t("messages.yourPriorityToday")
                              : `Ensuite · ${index + 1}`}
                          </span>
                          <TaskPriorityBadge priority={task.priority} />
                          <TaskStatusBadge status={task.status} />
                        </div>
                        {index === 0 && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Target
                              className="mt-0.5 size-4 shrink-0 text-amber-600"
                              aria-hidden
                            />
                            <p>
                              <Localized>
                                {t(
                                  "messages.yourHighestPriorityTaskDueTodayWhenPrioritiesMatch",
                                )}
                              </Localized>
                              {task.status === "blocked" &&
                                t(
                                  "messages.itIsBlockedFirstCheckTheTasksItDepends",
                                )}
                            </p>
                          </div>
                        )}
                        <button
                          className="text-left text-xl font-semibold hover:underline focus-visible:outline-2"
                          onClick={() => openEdit(task.id)}
                        >
                          {task.title}
                        </button>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-4" aria-hidden />
                            {task.deadline &&
                              new Intl.DateTimeFormat(
                                locale === "en" ? "en-US" : "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: data.timezone,
                                },
                              ).format(task.deadline)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  task.category?.color ?? "#94a3b8",
                              }}
                              aria-hidden
                            />
                            {task.category?.name ?? t("messages.noCategory")}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => openEdit(task.id)}
                          >
                            <Localized>{t("messages.openTask")}</Localized>
                          </Button>
                          <Button
                            disabled={pending || !canMarkTaskComplete(task)}
                            onClick={() => void complete(task.id)}
                          >
                            <Check aria-hidden />
                            <Localized>{t("messages.done")}</Localized>
                          </Button>
                        </div>
                        {!canMarkTaskComplete(task) && (
                          <p className="text-sm text-muted-foreground">
                            <Localized>
                              {t(
                                "messages.completeBlockingTasksBeforeClosingThisOne",
                              )}
                            </Localized>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )
        )}
        {isFormOpen && selectedTaskId && showQuerySkeleton(detail) && (
          <Skeleton
            className="h-16 w-full"
            aria-label={t("messages.loadingTask")}
          />
        )}
        {isFormOpen && selectedTaskId && detail.isError && (
          <FeedbackState
            variant="error"
            description={t("messages.unableToOpenThisTask")}
          >
            <Button onClick={() => void detail.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
            <Button variant="outline" onClick={closeForm}>
              <Localized>{t("common.cancel")}</Localized>
            </Button>
          </FeedbackState>
        )}
        <TaskForm
          open={isFormOpen && (!selectedTaskId || Boolean(detail.data))}
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
          task={selectedTaskId ? detail.data : null}
          categories={categories.data ?? []}
          isSubmitting={pending}
          onSubmit={save}
        />
      </main>
    </DashboardLayout>
  );
}
