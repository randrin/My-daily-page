"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { FeedbackState } from "@/components/ui/feedback-state";
import { CalendarClock } from "lucide-react";
import { apiClient } from "@/api/client";
import { taskKeys } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showQuerySkeleton } from "@/lib/query-skeleton";

const conflictsSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(z.object({ id: z.string(), title: z.string() })),
});

export function TaskConflictWarning({
  deadline,
  excludeId,
}: {
  deadline: Date;
  excludeId?: string;
}) {
  const t = useTranslator();
  const iso = deadline.toISOString();
  const query = useQuery({
    queryKey: [...taskKeys.all, "conflicts", iso, excludeId],
    queryFn: async () => {
      const { data } = await apiClient.get("/tasks/conflicts", {
        params: { deadline: iso, excludeId },
      });
      return conflictsSchema.parse(data);
    },
    staleTime: 15_000,
  });
  if (showQuerySkeleton(query))
    return (
      <Skeleton
        className="h-12 w-full"
        aria-label={t("messages.checkingSchedulingConflicts")}
      />
    );
  if (query.isError)
    return (
      <FeedbackState
        variant="error"
        description={t(
          "messages.unableToCheckSchedulingConflictsYouCanStillSave",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void query.refetch()}
        >
          <Localized>{t("common.retry")}</Localized>
        </Button>
      </FeedbackState>
    );
  if (!query.data?.total) return null;
  return (
    <div
      role="status"
      className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <p className="flex items-center gap-2 font-medium">
        <CalendarClock className="size-4 shrink-0" aria-hidden />
        {query.data.total} <Localized>{t("messages.other2")}</Localized>
        {query.data.total > 1
          ? t("messages.tasksAreScheduled")
          : t("messages.taskIsScheduled")}{" "}
        <Localized>{t("messages.atThisTime")}</Localized>
      </p>
      <ul className="list-inside list-disc break-words">
        {query.data.items.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      {query.data.total > query.data.items.length && (
        <p>
          Et {query.data.total - query.data.items.length}{" "}
          <Localized>{t("messages.otherS")}</Localized>
        </p>
      )}
      <p>
        <Localized>
          {t(
            "messages.chooseAnotherTimeOrSaveDespiteThisOverlap",
          )}
        </Localized>
      </p>
    </div>
  );
}
