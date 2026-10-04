"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-profile";
import { useUpdateTaskSettings } from "@/hooks/use-task-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { taskSettingsSchema } from "@/schemas/task-settings.schema";

export function TaskSettingsScreen() {
  const profile = useMe();
  const update = useUpdateTaskSettings();
  const [draft, setDraft] = useState<string>();
  const [error, setError] = useState<string>();
  const value = draft ?? (profile.data?.defaultDeadlineDays == null ? "" : String(profile.data.defaultDeadlineDays));
  const save = async () => {
    const parsed = taskSettingsSchema.safeParse({ defaultDeadlineDays: value.trim() === "" ? null : Number(value) });
    if (!parsed.success) { setError("Saisis un nombre entier entre 0 et 3650, ou laisse le champ vide."); return; }
    setError(undefined);
    try {
      await update.mutateAsync(parsed.data);
      setDraft(undefined);
      toast.success("Paramètres enregistrés");
    } catch (cause) { toast.error(getApiErrorMessage(cause, "Impossible d’enregistrer les paramètres")); }
  };
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Valeurs par défaut des tâches</CardTitle><CardDescription>Ces réglages s’appliquent aux nouvelles tâches.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {showQuerySkeleton(profile) ? <><Skeleton className="h-4 w-48" /><Skeleton className="h-10 w-full" /></> : profile.isError ? (
            <div role="alert">Impossible de charger les paramètres. <Button variant="outline" onClick={() => void profile.refetch()}>Réessayer</Button></div>
          ) : <>
            <label htmlFor="default-deadline-days" className="text-sm font-medium">Échéance par défaut (en jours)</label>
            <Input id="default-deadline-days" type="number" min={0} max={3650} step={1} value={value} placeholder="Non définie" disabled={update.isPending} aria-invalid={Boolean(error)} aria-describedby="deadline-default-help" onChange={(event) => { setDraft(event.target.value); setError(undefined); }} />
            <p id="deadline-default-help" className="text-sm text-muted-foreground">0 = aujourd’hui, 7 = dans 7 jours. Laisse vide pour saisir l’échéance à chaque création. La date choisie dans le calendrier reste prioritaire.</p>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end"><Button onClick={save} disabled={update.isPending}>{update.isPending ? "Enregistrement…" : "Enregistrer"}</Button></div>
          </>}
        </CardContent>
      </Card>
    </div>
  );
}
