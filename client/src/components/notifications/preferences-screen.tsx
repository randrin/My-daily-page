"use client";

import { ActivationLabel } from "@/components/ui/activation-label";

import { PushSettings } from "./push-settings";

import { FeedbackState } from "@/components/ui/feedback-state";
import React from "react";
import Link from "next/link";
import { DailySettings } from "@/components/notifications/daily-settings";
import { Bell, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { PreferenceForm } from "@/components/notifications/preference-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PreferenceListSkeleton } from "@/components/ui/data-skeleton";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useCreateNotificationPreference,
  useDeleteNotificationPreference,
  useNotificationPreferences,
  useUpdateNotificationPreference
} from "@/hooks/use-notification-preferences";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import {
  notifChannelLabels,
  notifChannels,
  type CreateNotificationPreferenceInput,
  type NotificationPreference,
  type UpdateNotificationPreferenceInput
} from "@/schemas/notification-preference.schema";

export function PreferencesScreen() {
  const settingsQuery = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const toggleReminders = async () => {
    if (!settingsQuery.data) return;
    try {
      const result = await updateSettings.mutateAsync(
        !settingsQuery.data.notificationsEnabled
      );
      toast.success(
        result.notificationsEnabled ? "Rappels activés" : "Rappels désactivés"
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de modifier les rappels")
      );
    }
  };
  const preferencesQuery = useNotificationPreferences();
  const { data: preferences = [], isError, refetch } = preferencesQuery;
  const showSkeleton = showQuerySkeleton(preferencesQuery);
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NotificationPreference | null>(
    null
  );
  const [pendingDelete, setPendingDelete] =
    React.useState<NotificationPreference | null>(null);

  const usedChannels = new Set(preferences.map((item) => item.channel));
  const availableChannels = notifChannels.filter(
    (channel) => !usedChannels.has(channel)
  );
  const isSaving = createPreference.isPending || updatePreference.isPending;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (preference: NotificationPreference) => {
    setEditing(preference);
    setFormOpen(true);
  };

  const handleCreate = async (input: CreateNotificationPreferenceInput) => {
    try {
      await createPreference.mutateAsync(input);
      toast.success("Préférence créée");
      setFormOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la préférence")
      );
    }
  };

  const handleUpdate = async (input: UpdateNotificationPreferenceInput) => {
    if (!editing) return;
    try {
      await updatePreference.mutateAsync({ id: editing.id, input });
      toast.success("Préférence mise à jour");
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la préférence")
      );
    }
  };

  const handleToggle = async (preference: NotificationPreference) => {
    try {
      await updatePreference.mutateAsync({
        id: preference.id,
        input: { enabled: !preference.enabled }
      });
      toast.success(preference.enabled ? "Canal désactivé" : "Canal activé");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de modifier le canal"));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePreference.mutateAsync(pendingDelete.id);
      toast.success("Préférence supprimée");
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de supprimer la préférence")
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Préférences de notification</h1>
            <p className="text-muted-foreground">
              Choisis tes canaux et tes rappels. Les horaires et les pauses se
              règlent dans{" "}
              <Link
                href="/dashboard/settings"
                className="underline underline-offset-4"
              >
                Paramètres
              </Link>
              .
            </p>
          </div>
          <Button
            onClick={openCreate}
            disabled={availableChannels.length === 0}
          >
            <Plus className="h-4 w-4" />
            Nouvelle préférence
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recevoir des rappels</CardTitle>
            <CardDescription>
              Active les rappels pour tes tâches. Si tu les désactives, tes
              réglages par canal sont conservés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showQuerySkeleton(settingsQuery) ? (
              <PreferenceListSkeleton rows={1} />
            ) : settingsQuery.isError ? (
              <FeedbackState
                variant="error"
                description="Impossible de charger le choix de réception."
              >
                <Button
                  variant="outline"
                  onClick={() => void settingsQuery.refetch()}
                >
                  Réessayer
                </Button>
              </FeedbackState>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {settingsQuery.data?.notificationsEnabled
                    ? "Les rappels sont actifs pour les canaux activés ci-dessous."
                    : "Les rappels sont désactivés. Aucun nouveau rappel ne sera envoyé."}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-label="Recevoir des rappels"
                  aria-checked={
                    settingsQuery.data?.notificationsEnabled ?? false
                  }
                  disabled={!settingsQuery.data || updateSettings.isPending}
                  onClick={() => void toggleReminders()}
                  className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
                    settingsQuery.data?.notificationsEnabled
                      ? "bg-primary"
                      : "bg-input"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full bg-background shadow transition-transform ${
                      settingsQuery.data?.notificationsEnabled
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tes canaux</CardTitle>
            <CardDescription>
              Email, SMS, WhatsApp et Push : un seul enregistrement par canal.
              Un canal désactivé ne recevra pas de rappel.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {showSkeleton ? (
              <div aria-busy="true" aria-live="polite">
                <PreferenceListSkeleton rows={3} />
              </div>
            ) : null}

            {isError ? (
              <FeedbackState
                variant="error"
                description="Impossible de charger tes préférences."
              >
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </FeedbackState>
            ) : null}

            {!showSkeleton && !isError && preferences.length === 0 ? (
              <FeedbackState
                icon={Bell}
                description="Aucune préférence pour l’instant."
              >
                <Button variant="outline" onClick={openCreate}>
                  Créer la première
                </Button>
              </FeedbackState>
            ) : null}

            {!showSkeleton && !isError
              ? preferences.map((preference) => (
                  <div
                    key={preference.id}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {notifChannelLabels[preference.channel]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {preference.enabled
                          ? "Les rappels peuvent partir sur ce canal."
                          : "Canal coupé : aucun rappel ne partira."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={preference.enabled ? "default" : "outline"}
                      aria-pressed={preference.enabled}
                      aria-label={
                        preference.enabled
                          ? `Désactiver ${
                              notifChannelLabels[preference.channel]
                            }`
                          : `Activer ${notifChannelLabels[preference.channel]}`
                      }
                      disabled={updatePreference.isPending}
                      onClick={() => handleToggle(preference)}
                    >
                      <ActivationLabel enabled={preference.enabled} />
                    </Button>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Modifier ${
                          notifChannelLabels[preference.channel]
                        }`}
                        onClick={() => openEdit(preference)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Supprimer ${
                          notifChannelLabels[preference.channel]
                        }`}
                        onClick={() => setPendingDelete(preference)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))
              : null}
          </CardContent>
        </Card>
        <PushSettings />
        <DailySettings />
      </div>

      <PreferenceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        preference={editing}
        availableChannels={availableChannels}
        isSubmitting={isSaving}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <DialogTitle>Supprimer la préférence</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `Le canal ${
                    notifChannelLabels[pendingDelete.channel]
                  } ne sera plus utilisable pour tes rappels.`
                : "Cette action est définitive."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-0 flex-row justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deletePreference.isPending}
            >
              <Undo2 className="size-4" />
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePreference.isPending}
            >
              <Trash2 className="size-4" />
              {deletePreference.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
