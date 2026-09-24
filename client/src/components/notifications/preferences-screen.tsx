"use client";

import React from "react";
import { Bell, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { PreferenceForm } from "@/components/notifications/preference-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PreferenceListSkeleton } from "@/components/ui/data-skeleton";
import {
  useCreateNotificationPreference,
  useDeleteNotificationPreference,
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/hooks/use-notification-preferences";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import {
  notifChannelLabels,
  notifChannels,
  type CreateNotificationPreferenceInput,
  type NotificationPreference,
  type UpdateNotificationPreferenceInput,
} from "@/schemas/notification-preference.schema";

export function PreferencesScreen() {
  const preferencesQuery = useNotificationPreferences();
  const {
    data: preferences = [],
    isError,
    refetch,
  } = preferencesQuery;
  const showSkeleton = showQuerySkeleton(preferencesQuery);
  const createPreference = useCreateNotificationPreference();
  const updatePreference = useUpdateNotificationPreference();
  const deletePreference = useDeleteNotificationPreference();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NotificationPreference | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] =
    React.useState<NotificationPreference | null>(null);

  const usedChannels = new Set(preferences.map((item) => item.channel));
  const availableChannels = notifChannels.filter(
    (channel) => !usedChannels.has(channel),
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
        getApiErrorMessage(error, "Impossible d’enregistrer la préférence"),
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
        getApiErrorMessage(error, "Impossible d’enregistrer la préférence"),
      );
    }
  };

  const handleToggle = async (preference: NotificationPreference) => {
    try {
      await updatePreference.mutateAsync({
        id: preference.id,
        input: { enabled: !preference.enabled },
      });
      toast.success(
        preference.enabled ? "Canal désactivé" : "Canal activé",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de modifier le canal"),
      );
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
        getApiErrorMessage(error, "Impossible de supprimer la préférence"),
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
              Choisis par quels canaux tu veux être relancé. L’envoi reste côté
              serveur.
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
            <CardTitle>Tes canaux</CardTitle>
            <CardDescription>
              Email, SMS et WhatsApp : un seul enregistrement par canal. Un
              canal désactivé ne recevra pas de rappel.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {showSkeleton ? (
              <div aria-busy="true" aria-live="polite">
                <PreferenceListSkeleton rows={3} />
              </div>
            ) : null}

            {isError ? (
              <div className="flex flex-col items-start gap-3 py-6 text-sm">
                <p className="text-destructive">
                  Impossible de charger tes préférences.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            ) : null}

            {!showSkeleton && !isError && preferences.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Bell className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Aucune préférence pour l’instant.
                </p>
                <Button variant="outline" onClick={openCreate}>
                  Créer la première
                </Button>
              </div>
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
                          ? `Désactiver ${notifChannelLabels[preference.channel]}`
                          : `Activer ${notifChannelLabels[preference.channel]}`
                      }
                      disabled={updatePreference.isPending}
                      onClick={() => handleToggle(preference)}
                    >
                      {preference.enabled ? "Activé" : "Désactivé"}
                    </Button>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Modifier ${notifChannelLabels[preference.channel]}`}
                        onClick={() => openEdit(preference)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Supprimer ${notifChannelLabels[preference.channel]}`}
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

      <Sheet
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="border-b px-6 py-5 pr-12">
            <SheetTitle>Supprimer la préférence</SheetTitle>
            <SheetDescription>
              {pendingDelete
                ? `Le canal ${notifChannelLabels[pendingDelete.channel]} ne sera plus utilisable pour tes rappels.`
                : "Cette action est définitive."}
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deletePreference.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePreference.isPending}
            >
              {deletePreference.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
