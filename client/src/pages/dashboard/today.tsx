"use client";

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
      toast.success(selectedTaskId ? "Tâche modifiée" : "Tâche créée");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la tâche"),
      );
    }
  }

  async function complete(id: string) {
    try {
      await update.mutateAsync({ id, input: { status: "done" } });
      toast.success("Une tâche de moins, bravo !");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de terminer la tâche"));
    }
  }

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
        <section className="rounded-2xl border bg-gradient-to-br from-amber-100/70 via-background to-sky-100/60 p-6 dark:from-amber-950/30 dark:to-sky-950/30">
          <Sun
            className="mb-3 size-8 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            Une page. Une journée.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Concentre-toi sur tes trois prochaines tâches, les urgentes en
            premier.
          </p>
          {data && (
            <p className="mt-3 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "full",
                timeZone: "UTC",
              }).format(new Date(`${data.date}T12:00:00Z`))}{" "}
              · {data.timezone}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={openCreate}>
              <Plus aria-hidden />
              Nouvelle tâche
            </Button>
            {data && <TaskListTemplate timezone={data.timezone} />}
            <Button variant="outline" asChild>
              <Link href="/dashboard/tasks">Toutes mes tâches</Link>
            </Button>
          </div>
        </section>
        {showQuerySkeleton(query) ? (
          <div className="space-y-4" aria-label="Chargement de la journée">
            <Skeleton className="h-6 w-48" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : query.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger ta journée."
          >
            <Button variant="outline" onClick={() => void query.refetch()}>
              Réessayer
            </Button>
          </FeedbackState>
        ) : (
          data && (
            <>
              <p className="text-sm text-muted-foreground">
                {data.completed} / {data.total} tâches terminées aujourd’hui
                {data.total - data.completed > 3
                  ? ` · ${data.total - data.completed} restantes, trois affichées`
                  : ""}
              </p>
              {!data.items.length ? (
                <FeedbackState
                  icon={Check}
                  title={
                    data.total
                      ? "Ta journée est à jour"
                      : "Une journée à organiser"
                  }
                  description={
                    data.total
                      ? "Toutes tes tâches dues aujourd’hui sont terminées."
                      : "Aucune tâche prévue pour aujourd’hui. Tu peux en ajouter une ou consulter les prochaines."
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
                              ? "Ta priorité du jour"
                              : `Ensuite · ${index + 1}`}
                          </span>
                          <TaskPriorityBadge priority={task.priority} />
                          <TaskStatusBadge status={task.status} />
                        </div>
                        {index === 0 && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Target className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                            <p>
                              La plus prioritaire parmi tes tâches dues aujourd’hui ; à priorité égale, l’échéance la plus proche passe en premier.
                              {task.status === "blocked" && " Elle est bloquée : commence par vérifier les tâches dont elle dépend."}
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
                              new Intl.DateTimeFormat("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: data.timezone,
                              }).format(task.deadline)}
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
                            {task.category?.name ?? "Sans catégorie"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => openEdit(task.id)}
                          >
                            Ouvrir la tâche
                          </Button>
                          <Button
                            disabled={pending || !canMarkTaskComplete(task)}
                            onClick={() => void complete(task.id)}
                          >
                            <Check aria-hidden />
                            J’ai fait
                          </Button>
                        </div>
                        {!canMarkTaskComplete(task) && (
                          <p className="text-sm text-muted-foreground">
                            Termine les tâches qui bloquent avant de clôturer
                            celle-ci.
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
            aria-label="Chargement de la tâche"
          />
        )}
        {isFormOpen && selectedTaskId && detail.isError && (
          <FeedbackState
            variant="error"
            description="Impossible d’ouvrir cette tâche."
          >
            <Button onClick={() => void detail.refetch()}>Réessayer</Button>
            <Button variant="outline" onClick={closeForm}>
              Annuler
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
