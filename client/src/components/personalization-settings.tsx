"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RotateCcw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  defaultValues,
  defaultsSchema,
  personalizationApi,
  type TaskDefaults,
} from "@/api/personalization";
import { useTaskDefaults } from "@/hooks/use-personalization";
import { useCategories } from "@/hooks/use-categories";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function PersonalizationSettings() {
  const query = useTaskDefaults(),
    categories = useCategories(),
    cache = useQueryClient();
  const [draft, setDraft] = useState<TaskDefaults>(),
    [errors, setErrors] = useState<Record<string, string>>({});
  const value = draft ?? query.data ?? defaultValues;
  const mutation = useMutation({
    mutationFn: personalizationApi.saveDefaults,
    onSuccess: async () => {
      setDraft(undefined);
      await cache.invalidateQueries({
        queryKey: ["personalization", "defaults"],
      });
      toast.success("Valeurs par défaut enregistrées");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Enregistrement impossible")),
  });
  const choice = (
    key: Exclude<keyof TaskDefaults, "reminderLeadMinutes">,
    label: string,
    options: readonly (readonly [string, string])[],
  ) => (
    <div className="space-y-2">
      <label htmlFor={`default-${key}`} className="text-sm font-medium">
        {label}
      </label>
      <Select
        value={value[key] ?? "none"}
        disabled={mutation.isPending}
        onValueChange={(next) =>
          setDraft({ ...value, [key]: next === "none" ? null : next })
        }
      >
        <SelectTrigger id={`default-${key}`} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([id, text]) => (
            <SelectItem value={id} key={id}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  function validate() {
    const result = defaultsSchema.safeParse(value);
    setErrors(
      result.success
        ? {}
        : Object.fromEntries(
            result.error.issues.map((i) => [String(i.path[0]), i.message]),
          ),
    );
    return result;
  }
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="size-5 shrink-0" aria-hidden />
        Valeurs par défaut et affichage
      </h2>
      <p className="text-sm text-muted-foreground">
        Les valeurs proposées restent modifiables à la création. Le délai de
        rappel concerne les nouvelles tâches non urgentes, avec les canaux déjà
        autorisés. Les urgences gardent leur escalade ; l’escalade adaptative,
        si activée, reste prioritaire.
      </p>
      {showQuerySkeleton(query) || showQuerySkeleton(categories) ? (
        <Skeleton className="h-60" />
      ) : query.isError || categories.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger les valeurs par défaut"
        >
          <Button
            onClick={() => {
              void query.refetch();
              void categories.refetch();
            }}
          >
            Réessayer
          </Button>
        </FeedbackState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {choice("priority", "Priorité", [
              ["low", "Basse"],
              ["medium", "Moyenne"],
              ["high", "Haute"],
              ["urgent", "Urgente"],
            ])}
            {choice("categoryId", "Catégorie", [
              ["none", "Aucune"],
              ...(categories.data ?? []).map((c) => [c.id, c.name] as const),
            ])}
            <div className="space-y-2">
              <label
                htmlFor="default-lead"
                className={`text-sm font-medium ${errors.reminderLeadMinutes ? "text-destructive" : ""}`}
              >
                Rappel avant l’échéance (minutes)
              </label>
              <Input
                id="default-lead"
                type="number"
                min={0}
                max={10080}
                placeholder="Ex. 60 pour une heure avant"
                value={
                  Number.isNaN(value.reminderLeadMinutes)
                    ? ""
                    : value.reminderLeadMinutes
                }
                disabled={mutation.isPending}
                aria-invalid={!!errors.reminderLeadMinutes}
                aria-describedby="default-lead-error"
                onBlur={validate}
                onChange={(e) => {
                  const next =
                    e.target.value === "" ? NaN : Number(e.target.value);
                  setDraft({ ...value, reminderLeadMinutes: next });
                  setErrors({});
                }}
              />
              {errors.reminderLeadMinutes && (
                <p
                  id="default-lead-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.reminderLeadMinutes}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                0 = à l’échéance. Maximum 7 jours. Si le créneau calculé est
                déjà passé, aucun rattrapage n’est envoyé.
              </p>
            </div>
            {choice("dashboardPeriod", "Période initiale du tableau de bord", [
              ["7d", "7 jours"],
              ["1m", "1 mois"],
              ["2m", "2 mois"],
              ["3m", "3 mois"],
            ])}
            {choice("taskView", "Vue initiale des tâches", [
              ["table", "Liste / tableau"],
              ["grid", "Grille"],
            ])}
            {choice("taskSort", "Tri initial", [
              ["deadline", "Échéance"],
              ["priority", "Priorité"],
              ["title", "Titre"],
              ["status", "Statut"],
            ])}
            {choice("sortDirection", "Sens du tri", [
              ["asc", "Croissant"],
              ["desc", "Décroissant"],
            ])}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                const result = validate();
                if (result.success) mutation.mutate(result.data);
              }}
            >
              <Save aria-hidden />
              Enregistrer
            </Button>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                setDraft(defaultValues);
                setErrors({});
              }}
            >
              <RotateCcw aria-hidden />
              Rétablir les valeurs proposées
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
