"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { ActivationLabel } from "@/components/ui/activation-label";

import { PushSettings } from "./push-settings";

import { FeedbackState } from "@/components/ui/feedback-state";
import React from "react";
import Link from "next/link";
import { DailySettings } from "@/components/notifications/daily-settings";
import { Bell, Radio, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreferenceListSkeleton } from "@/components/ui/data-skeleton";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
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
  const t = useTranslator();
  const settingsQuery = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const toggleReminders = async () => {
    if (!settingsQuery.data) return;
    try {
      const result = await updateSettings.mutateAsync(
        !settingsQuery.data.notificationsEnabled,
      );
      toast.success(
        result.notificationsEnabled
          ? t("messages.remindersEnabled")
          : t("messages.remindersDisabled"),
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de modifier les rappels"),
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
      toast.success(t("messages.preferenceCreated"));
      setFormOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSavePreference")),
      );
    }
  };

  const handleUpdate = async (input: UpdateNotificationPreferenceInput) => {
    if (!editing) return;
    try {
      await updatePreference.mutateAsync({ id: editing.id, input });
      toast.success(t("messages.preferenceUpdated"));
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSavePreference")),
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
        preference.enabled ? t("messages.channelDisabled") : t("messages.channelEnabled"),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de modifier le canal"));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePreference.mutateAsync(pendingDelete.id);
      toast.success(t("messages.preferenceDeleted"));
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToDeletePreference")),
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageTitle icon={Bell}>
              <Localized>{t("messages.notificationPreferences")}</Localized>
            </PageTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.chooseYourChannelsAndRemindersManageQuietHoursAnd",
                )}
              </Localized>{" "}
              <Link
                href="/dashboard/settings"
                className="underline underline-offset-4"
              >
                <Localized>{t("navigation.settings")}</Localized>
              </Link>
              .
            </p>
          </div>
          <Button
            onClick={openCreate}
            disabled={availableChannels.length === 0}
          >
            <Plus className="h-4 w-4" />
            <Localized>{t("messages.newPreference")}</Localized>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 shrink-0" aria-hidden />
              <Localized>{t("messages.receiveReminders")}</Localized>
            </CardTitle>
            <CardDescription>
              <Localized>
                {t(
                  "messages.enableRemindersForYourTasksDisablingThemPreservesYour",
                )}
              </Localized>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showQuerySkeleton(settingsQuery) ? (
              <PreferenceListSkeleton rows={1} />
            ) : settingsQuery.isError ? (
              <FeedbackState
                variant="error"
                description={t("messages.unableToLoadReminderPreference")}
              >
                <Button
                  variant="outline"
                  onClick={() => void settingsQuery.refetch()}
                >
                  <Localized>{t("common.retry")}</Localized>
                </Button>
              </FeedbackState>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {settingsQuery.data?.notificationsEnabled
                    ? t(
                        "messages.remindersAreActiveForTheChannelsEnabledBelow",
                      )
                    : t(
                        "messages.remindersAreDisabledNoNewRemindersWillBeSent",
                      )}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-label={t("messages.receiveReminders")}
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
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-5 shrink-0" aria-hidden />
              <Localized>{t("messages.yourChannels")}</Localized>
            </CardTitle>
            <CardDescription>
              <Localized>
                {t(
                  "messages.emailSmsWhatsappAndPushOneEntryPerChannel",
                )}
              </Localized>
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
                description={t("messages.unableToLoadYourPreferences")}
              >
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <Localized>{t("common.retry")}</Localized>
                </Button>
              </FeedbackState>
            ) : null}

            {!showSkeleton && !isError && preferences.length === 0 ? (
              <FeedbackState
                icon={Bell}
                description={t("messages.noPreferencesYet")}
              >
                <Button variant="outline" onClick={openCreate}>
                  <Localized>{t("messages.createYourFirst")}</Localized>
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
                          : t("messages.channelDisabledNoRemindersWillBeSent")}
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
            <DialogTitle>
              <Localized>{t("messages.deletePreference")}</Localized>
            </DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `Le canal ${
                    notifChannelLabels[pendingDelete.channel]
                  } ne sera plus utilisable pour tes rappels.`
                : t("messages.thisActionIsPermanent")}
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
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePreference.isPending}
            >
              <Trash2 className="size-4" />
              {deletePreference.isPending ? "Suppression…" : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
