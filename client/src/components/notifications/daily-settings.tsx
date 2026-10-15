"use client";

import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { ActivationLabel } from "@/components/ui/activation-label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PROFILE_TIMEZONES } from "@/schemas/profile.schema";
import { formatTravelPause, parseTravelPause } from "@/lib/travel-pause";
import { useState } from "react";
import {
  CalendarIcon,
  Plane,
  Moon,
  Save,
  Sunrise,
  CalendarClock,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDailySettings,
  useUpdateDailySettings,
} from "@/hooks/use-daily-settings";
import {
  dailySettingsInputSchema,
  type DailySettingsInput,
} from "@/schemas/daily-settings.schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

type SettingsSection = "notifications" | "timezone" | "availability";

const sectionCopy = {
  notifications: {
    title: "messages.summaryAndFollowUps",
    description: "messages.chooseRemindersThatSupportYourDay",
  },
  timezone: {
    title: "messages.dateAndTime",
    description: "messages.theTimeZoneUsedForYourDueDatesAnd",
  },
  availability: {
    title: "messages.availability",
    description: "messages.pauseRemindersOrAdaptThemToYourSchedule",
  },
};

export function DailySettings({
  section = "notifications",
}: {
  section?: SettingsSection;
}) {
  const t = useTranslator();
  const query = useDailySettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {section === "availability" ? (
            <Clock className="size-5 shrink-0" aria-hidden />
          ) : section === "timezone" ? (
            <CalendarClock className="size-5 shrink-0" aria-hidden />
          ) : (
            <Sunrise className="size-5 shrink-0" aria-hidden />
          )}
          <Localized>{sectionCopy[section].title}</Localized>
        </CardTitle>
        <CardDescription>
          <Localized>{sectionCopy[section].description}</Localized>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showQuerySkeleton(query) ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : query.isError ? (
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadTheseSettings")}
          >
            <Button variant="outline" onClick={() => void query.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : query.data ? (
          <DailySettingsForm
            section={section}
            initial={query.data}
            timezone={query.data.timezone}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function DailySettingsForm({
  section,
  initial,
  timezone,
}: {
  section: SettingsSection;
  initial: DailySettingsInput;
  timezone: string;
}) {
  const { locale } = useLocale();
  const t = useTranslator();
  const [draft, setDraft] = useState<DailySettingsInput>();
  const [pauseCalendarOpen, setPauseCalendarOpen] = useState(false);
  const [calendarNow, setCalendarNow] = useState<string>();
  const [pauseDraft, setPauseDraft] = useState<string>();
  const [error, setError] = useState<string>();
  const value = draft ?? initial;
  const zone = value.timezone ?? timezone;
  const pauseValue =
    pauseDraft ?? formatTravelPause(value.notificationsPausedUntil, zone);
  const todayInZone = calendarNow
    ? new Date(`${formatTravelPause(calendarNow, zone).slice(0, 10)}T00:00:00`)
    : undefined;
  const pauseDate = pauseValue.slice(0, 10);
  const selectedPauseDate = pauseDate
    ? new Date(`${pauseDate}T12:00:00`)
    : undefined;
  const changePause = (next: string) => {
    setPauseDraft(next);
    setDraft({ ...value });
    setError(undefined);
  };
  const zones = (PROFILE_TIMEZONES as readonly string[]).includes(zone)
    ? [...PROFILE_TIMEZONES]
    : [zone, ...PROFILE_TIMEZONES];
  const update = useUpdateDailySettings();
  const patch = (change: Partial<DailySettingsInput>) => {
    setDraft({ ...value, ...change });
    setError(undefined);
  };
  const save = async () => {
    const pause =
      pauseDraft === undefined
        ? value.notificationsPausedUntil
        : parseTravelPause(pauseDraft, zone);
    if (pauseDraft && (!pause || new Date(pause) <= new Date())) {
      setError(
        t(
          "messages.chooseAValidFutureDateAndTimeInThe",
        ),
      );
      return;
    }
    const parsed = dailySettingsInputSchema.safeParse({
      ...value,
      timezone: zone,
      notificationsPausedUntil: pause,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      const fields =
        section === "notifications"
          ? {
              dailyDigestEnabled: parsed.data.dailyDigestEnabled,
              adaptiveEscalationEnabled: parsed.data.adaptiveEscalationEnabled,
            }
          : section === "timezone"
            ? { timezone: parsed.data.timezone }
            : {
                notificationsPausedUntil: parsed.data.notificationsPausedUntil,
                quietHoursEnabled: parsed.data.quietHoursEnabled,
                quietHoursStart: parsed.data.quietHoursStart,
                quietHoursEnd: parsed.data.quietHoursEnd,
                quietHoursAllowUrgent: parsed.data.quietHoursAllowUrgent,
                smartQuietHoursEnabled: parsed.data.smartQuietHoursEnabled,
              };
      await update.mutateAsync({ ...initial, ...fields });
      setDraft(undefined);
      setPauseDraft(undefined);
      toast.success(t("messages.settingsSaved"));
    } catch (cause) {
      toast.error(
        getApiErrorMessage(cause, t("messages.unableToSaveTheseSettings")),
      );
    }
  };
  const toggle = (
    id: string,
    label: string,
    checked: boolean,
    onChange: () => void,
  ) => (
    <Button
      id={id}
      type="button"
      variant={checked ? "default" : "outline"}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={update.isPending}
      onClick={onChange}
    >
      <ActivationLabel enabled={checked} />
    </Button>
  );
  return (
    <div className="space-y-6">
      {section === "timezone" && (
        <div className="space-y-2">
          <label htmlFor="travel-timezone" className="text-sm font-medium">
            <Localized>{t("messages.profileTimeZone")}</Localized>
          </label>
          <Select
            value={zone}
            disabled={update.isPending}
            onValueChange={(timezone) => patch({ timezone })}
          >
            <SelectTrigger id="travel-timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zones.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {section === "availability" && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="flex items-center gap-2 font-medium">
            <Plane className="size-4" aria-hidden />
            <Localized>{t("messages.travelMode")}</Localized>
          </h3>
          <p className="text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.pauseAllRemindersIncludingUrgentOnesTheyResumeAutomatically",
              )}
            </Localized>
          </p>
          <div className="space-y-2">
            <label htmlFor="travel-pause" className="text-sm font-medium">
              <Localized>{t("messages.pauseUntil")}</Localized>
              {zone})
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
              <Popover
                open={pauseCalendarOpen}
                onOpenChange={(open) => {
                  if (open) setCalendarNow(new Date().toISOString());
                  setPauseCalendarOpen(open);
                }}
                modal
              >
                <PopoverTrigger asChild>
                  <Button
                    id="travel-pause"
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={update.isPending}
                  >
                    {selectedPauseDate
                      ? format(selectedPauseDate, "d MMMM yyyy", {
                          locale: locale === "en" ? enUS : fr,
                        })
                      : t("messages.chooseADate")}
                    <CalendarIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={fr}
                    captionLayout="dropdown"
                    selected={selectedPauseDate}
                    disabled={todayInZone ? { before: todayInZone } : undefined}
                    startMonth={
                      todayInZone
                        ? new Date(
                            todayInZone.getFullYear(),
                            todayInZone.getMonth(),
                            1,
                          )
                        : undefined
                    }
                    endMonth={
                      todayInZone
                        ? new Date(todayInZone.getFullYear() + 20, 11, 1)
                        : undefined
                    }
                    defaultMonth={
                      selectedPauseDate &&
                      todayInZone &&
                      selectedPauseDate < todayInZone
                        ? todayInZone
                        : selectedPauseDate
                    }
                    onSelect={(date) => {
                      changePause(
                        date
                          ? `${format(date, "yyyy-MM-dd")}T${pauseValue.slice(11) || "09:00"}`
                          : "",
                      );
                      setPauseCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Input
                aria-label={`Heure de fin de pause (${zone})`}
                type="time"
                value={pauseValue.slice(11)}
                disabled={update.isPending || !pauseDate}
                onChange={(event) =>
                  changePause(`${pauseDate}T${event.target.value}`)
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.leaveEmptyToKeepRemindersActiveChangingTimeZone",
                )}
              </Localized>
            </p>
          </div>
          {pauseValue && (
            <Button
              type="button"
              variant="outline"
              disabled={update.isPending}
              onClick={() => {
                setPauseDraft("");
                patch({ notificationsPausedUntil: null });
              }}
            >
              <Localized>{t("messages.endPause")}</Localized>
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            <Localized>
              {t(
                "messages.clickSaveToApplyTheseSettingsSummariesForPaused",
              )}
            </Localized>
          </p>
        </section>
      )}

      {section === "notifications" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label htmlFor="adaptive-escalation" className="font-medium">
                <Localized>{t("messages.adaptiveEscalation")}</Localized>
              </label>
              <p className="text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.forAnOpenNonUrgentTaskEmailAtThe",
                  )}
                </Localized>
              </p>
            </div>
            {toggle(
              "adaptive-escalation",
              t("messages.adaptiveEscalation"),
              value.adaptiveEscalationEnabled ?? false,
              () =>
                patch({
                  adaptiveEscalationEnabled: !value.adaptiveEscalationEnabled,
                }),
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label
                htmlFor="daily-digest"
                className="flex items-center gap-2 font-medium"
              >
                <Sunrise className="size-4" aria-hidden />
                <Localized>{t("messages.730MorningEmailSummary")}</Localized>
              </label>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.yourTopThreePrioritiesInOneEmailRequiresReminders",
                  )}
                </Localized>
              </p>
            </div>
            {toggle(
              "daily-digest",
              t("messages.morningEmailSummary"),
              value.dailyDigestEnabled,
              () => patch({ dailyDigestEnabled: !value.dailyDigestEnabled }),
            )}
          </div>
        </>
      )}
      {section === "availability" && (
        <div className="space-y-4 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label
                htmlFor="quiet-hours"
                className="flex items-center gap-2 font-medium"
              >
                <Moon className="size-4" aria-hidden />
                <Localized>{t("messages.quietHours")}</Localized>
              </label>
              <p className="mt-1 text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.remindersWaitUntilThisPeriodEndsIncludingTheMorning",
                  )}
                </Localized>
              </p>
            </div>
            {toggle(
              "quiet-hours",
              t("messages.quietHours"),
              value.quietHoursEnabled,
              () => patch({ quietHoursEnabled: !value.quietHoursEnabled }),
            )}
          </div>
          {value.quietHoursEnabled && (
            <>
              <div className="grid max-w-md grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quiet-start" className="text-sm font-medium">
                    <Localized>{t("messages.start")}</Localized>
                  </label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={value.quietHoursStart}
                    disabled={update.isPending}
                    onChange={(event) =>
                      patch({ quietHoursStart: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quiet-end" className="text-sm font-medium">
                    <Localized>{t("messages.end")}</Localized>
                  </label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={value.quietHoursEnd}
                    disabled={update.isPending}
                    aria-invalid={Boolean(error)}
                    onChange={(event) =>
                      patch({ quietHoursEnd: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label htmlFor="smart-quiet" className="text-sm">
                    <Localized>
                      {t("messages.smartQuietHours")}
                    </Localized>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    <Localized>
                      {t(
                        "messages.allowOnlyUrgentTasksDueTodayInYourTime",
                      )}
                    </Localized>
                  </p>
                </div>
                {toggle(
                  "smart-quiet",
                  t("messages.smartQuietHours"),
                  value.smartQuietHoursEnabled ?? false,
                  () =>
                    patch({
                      smartQuietHoursEnabled: !value.smartQuietHoursEnabled,
                    }),
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="quiet-urgent" className="text-sm">
                  <Localized>
                    {t(
                      "messages.allowUrgentTasksDuringQuietHours",
                    )}
                  </Localized>
                </label>
                {toggle(
                  "quiet-urgent",
                  "Autoriser les urgences pendant les horaires silencieux",
                  value.quietHoursAllowUrgent,
                  () =>
                    patch({
                      quietHoursAllowUrgent: !value.quietHoursAllowUrgent,
                    }),
                )}
              </div>
            </>
          )}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        <Localized>{t("messages.timeZone")}</Localized>
        {zone}
        <Localized>
          {t(
            "messages.changeItInSettingsDateAndTimeMessagesAlready",
          )}
        </Localized>
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          <Localized>{error}</Localized>
        </p>
      )}
      <div className="flex justify-end">
        <Button
          disabled={update.isPending || !draft}
          onClick={() => void save()}
        >
          <Save aria-hidden />
          {update.isPending ? "Enregistrement…" : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
