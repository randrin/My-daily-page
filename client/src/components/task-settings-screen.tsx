"use client";
import { Settings, ListTodo } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { PersonalizationSettings } from "@/components/personalization-settings";

import { MfaSettings } from "@/components/mfa-settings";
import { DailySettings } from "@/components/notifications/daily-settings";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-profile";
import { useUpdateTaskSettings } from "@/hooks/use-task-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { taskSettingsSchema } from "@/schemas/task-settings.schema";
import { Save } from "lucide-react";

export function TaskSettingsScreen() {
  const profile = useMe();
  const update = useUpdateTaskSettings();
  const [draft, setDraft] = useState<string>();
  const [error, setError] = useState<string>();
  const value =
    draft ??
    (profile.data?.defaultDeadlineDays == null
      ? ""
      : String(profile.data.defaultDeadlineDays));
  const save = async () => {
    const parsed = taskSettingsSchema.safeParse({
      defaultDeadlineDays: value.trim() === "" ? null : Number(value),
    });
    if (!parsed.success) {
      setError(
        "Saisis un nombre entier entre 0 et 3650, ou laisse le champ vide.",
      );
      return;
    }
    setError(undefined);
    try {
      await update.mutateAsync(parsed.data);
      setDraft(undefined);
      toast.success("Paramètres enregistrés");
    } catch (cause) {
      toast.error(
        getApiErrorMessage(cause, "Impossible d’enregistrer les paramètres"),
      );
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <PageTitle icon={Settings}>Paramètres</PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure tes tâches, ton fuseau et tes disponibilités. Les canaux et
          les résumés se règlent dans les{" "}
          <Link
            href="/dashboard/preferences"
            className="underline underline-offset-4"
          >
            Préférences de notification
          </Link>
          .
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="size-5 shrink-0" aria-hidden />
            Tâches
          </CardTitle>
          <CardDescription>
            Ces réglages s’appliquent aux nouvelles tâches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showQuerySkeleton(profile) ? (
            <>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : profile.isError ? (
            <FeedbackState
              variant="error"
              description="Impossible de charger les paramètres."
            >
              <Button variant="outline" onClick={() => void profile.refetch()}>
                Réessayer
              </Button>
            </FeedbackState>
          ) : (
            <>
              <label
                htmlFor="default-deadline-days"
                className="text-sm font-medium"
              >
                Échéance par défaut (en jours)
              </label>
              <Input
                id="default-deadline-days"
                type="number"
                min={0}
                max={3650}
                step={1}
                value={value}
                placeholder="Non définie"
                disabled={update.isPending}
                aria-invalid={Boolean(error)}
                aria-describedby="deadline-default-help"
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(undefined);
                }}
              />
              <p
                id="deadline-default-help"
                className="text-sm text-muted-foreground"
              >
                0 = aujourd’hui, 7 = dans 7 jours. Laisse vide pour saisir
                l’échéance à chaque création. La date choisie dans le calendrier
                reste prioritaire.
              </p>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button onClick={save} disabled={update.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {update.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <DailySettings section="timezone" />
      <DailySettings section="availability" />
      <PersonalizationSettings />
      <MfaSettings />
    </div>
  );
}
