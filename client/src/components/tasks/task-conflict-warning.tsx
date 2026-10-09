"use client";

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
        aria-label="Vérification des conflits horaires"
      />
    );
  if (query.isError)
    return (
      <FeedbackState
        variant="error"
        description="Impossible de vérifier les conflits horaires. Tu peux enregistrer la tâche."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void query.refetch()}
        >
          Réessayer
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
        {query.data.total} autre
        {query.data.total > 1 ? "s tâches sont prévues" : " tâche est prévue"} à
        cette heure.
      </p>
      <ul className="list-inside list-disc break-words">
        {query.data.items.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      {query.data.total > query.data.items.length && (
        <p>Et {query.data.total - query.data.items.length} autre(s).</p>
      )}
      <p>
        Tu peux choisir une autre heure ou enregistrer malgré ce chevauchement.
      </p>
    </div>
  );
}
