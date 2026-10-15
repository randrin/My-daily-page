"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { LanguageSelect } from "@/components/language-select";
import { Languages } from "lucide-react";
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
  const t = useTranslator();
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
      toast.success(t("messages.settingsSaved2"));
    } catch (cause) {
      toast.error(
        getApiErrorMessage(cause, t("messages.unableToSaveSettings")),
      );
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <PageTitle icon={Settings}>
          <Localized>{t("navigation.settings")}</Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.configureTasksTimeZoneAndAvailabilityChannelsAndSummaries",
            )}
          </Localized>{" "}
          <Link
            href="/dashboard/preferences"
            className="underline underline-offset-4"
          >
            <Localized>{t("messages.notificationPreferences")}</Localized>
          </Link>
          .
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="size-5" aria-hidden />
            <Localized>{t("settings.language")}</Localized>
          </CardTitle>
          <CardDescription>
            <Localized>
              {t(
                "messages.yourLanguageIsSavedToYourAccountAndUsed",
              )}
            </Localized>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelect />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="size-5 shrink-0" aria-hidden />
            <Localized>{t("navigation.tasks")}</Localized>
          </CardTitle>
          <CardDescription>
            <Localized>
              {t("messages.theseSettingsApplyToNewTasks")}
            </Localized>
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
              description={t("messages.unableToLoadSettings")}
            >
              <Button variant="outline" onClick={() => void profile.refetch()}>
                <Localized>{t("common.retry")}</Localized>
              </Button>
            </FeedbackState>
          ) : (
            <>
              <label
                htmlFor="default-deadline-days"
                className="text-sm font-medium"
              >
                <Localized>{t("messages.defaultDueDateDays")}</Localized>
              </label>
              <Input
                id="default-deadline-days"
                type="number"
                min={0}
                max={3650}
                step={1}
                value={value}
                placeholder={t("messages.notSet")}
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
                <Localized>
                  {t(
                    "messages.0Today7InSevenDaysLeaveEmptyTo",
                  )}
                </Localized>
              </p>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  <Localized>{error}</Localized>
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button onClick={save} disabled={update.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {update.isPending ? "Enregistrement…" : t("common.save")}
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
