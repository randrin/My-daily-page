"use client";

import { ActivationLabel } from "@/components/ui/activation-label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PROFILE_TIMEZONES } from "@/schemas/profile.schema";
import { formatTravelPause, parseTravelPause } from "@/lib/travel-pause";
import { useState } from "react";
import { CalendarIcon, Plane, Moon, Save, Sunrise } from "lucide-react";
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
    title: "Résumé et relances",
    description: "Choisis les rappels qui accompagnent ta journée.",
  },
  timezone: {
    title: "Date et heure",
    description: "Le fuseau utilisé pour tes échéances et tes rappels.",
  },
  availability: {
    title: "Disponibilité",
    description: "Suspends les rappels ou adapte-les à tes horaires.",
  },
};

export function DailySettings({
  section = "notifications",
}: {
  section?: SettingsSection;
}) {
  const query = useDailySettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{sectionCopy[section].title}</CardTitle>
        <CardDescription>{sectionCopy[section].description}</CardDescription>
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
            description="Impossible de charger ces réglages."
          >
            <Button variant="outline" onClick={() => void query.refetch()}>
              Réessayer
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
        "Choisis une date et une heure futures valides dans le fuseau sélectionné.",
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
      toast.success("Réglages enregistrés");
    } catch (cause) {
      toast.error(
        getApiErrorMessage(cause, "Impossible d’enregistrer ces réglages"),
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
            Fuseau horaire du profil
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
            Mode voyage
          </h3>
          <p className="text-sm text-muted-foreground">
            Suspends tous les rappels, urgences comprises. Ils reprennent
            automatiquement à la fin de la pause.
          </p>
          <div className="space-y-2">
            <label htmlFor="travel-pause" className="text-sm font-medium">
              Suspendre jusqu’au ({zone})
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
                      ? format(selectedPauseDate, "d MMMM yyyy", { locale: fr })
                      : "Choisir une date"}
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
              Laisse vide pour ne pas suspendre les rappels. Le changement de
              fuseau conserve l’instant des échéances existantes.
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
              Lever la pause
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Clique sur Enregistrer pour appliquer ces réglages. Les résumés des
            journées suspendues ne sont pas envoyés en rattrapage.
          </p>
        </section>
      )}

      {section === "notifications" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label htmlFor="adaptive-escalation" className="font-medium">
                Escalade adaptative
              </label>
              <p className="text-sm text-muted-foreground">
                Pour une tâche non urgente toujours ouverte : email à
                l’échéance, deuxième email une heure après, puis WhatsApp une
                heure après le deuxième envoi. Nécessite Email et WhatsApp avec
                consentement activés.
              </p>
            </div>
            {toggle(
              "adaptive-escalation",
              "Escalade adaptative",
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
                Résumé email à 7h30
              </label>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Tes trois premières priorités, dans un seul email. Nécessite les
                rappels et le canal Email activés. Aucun envoi si ta journée est
                vide.
              </p>
            </div>
            {toggle(
              "daily-digest",
              "Résumé email du matin",
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
                Horaires silencieux
              </label>
              <p className="mt-1 text-sm text-muted-foreground">
                Les rappels attendent la fin de cette plage, y compris le résumé
                du matin.
              </p>
            </div>
            {toggle(
              "quiet-hours",
              "Horaires silencieux",
              value.quietHoursEnabled,
              () => patch({ quietHoursEnabled: !value.quietHoursEnabled }),
            )}
          </div>
          {value.quietHoursEnabled && (
            <>
              <div className="grid max-w-md grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quiet-start" className="text-sm font-medium">
                    Début
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
                    Fin
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
                    Horaires silencieux intelligents
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Autoriser uniquement les urgences dont l’échéance tombe
                    aujourd’hui dans ton fuseau. Le mode voyage reste
                    prioritaire.
                  </p>
                </div>
                {toggle(
                  "smart-quiet",
                  "Horaires silencieux intelligents",
                  value.smartQuietHoursEnabled ?? false,
                  () =>
                    patch({
                      smartQuietHoursEnabled: !value.smartQuietHoursEnabled,
                    }),
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="quiet-urgent" className="text-sm">
                  Autoriser les tâches de priorité Urgente pendant cette plage
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
        Fuseau utilisé : {zone}. Modifiable dans Paramètres → Date et heure. Les
        messages déjà transmis au fournisseur ne peuvent pas être retenus.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button
          disabled={update.isPending || !draft}
          onClick={() => void save()}
        >
          <Save aria-hidden />
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
