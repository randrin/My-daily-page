"use client";
import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartNoAxesCombined,
  RefreshCw,
  Users,
  UserPlus,
  MousePointerClick,
} from "lucide-react";
import { getAdminAnalytics } from "@/api/admin-analytics";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { LineChart } from "@/components/charts/line-chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const timezones = [
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/London",
  "Africa/Douala",
  "Africa/Abidjan",
  "Africa/Kinshasa",
  "America/New_York",
  "America/Toronto",
  "UTC",
];
export function AdminAnalytics() {
  const { locale } = useLocale();
  const t = useTranslator();
  const [days, setDays] = useState(30),
    [timezone, setTimezone] = useState("Europe/Paris");
  const query = useQuery({
    queryKey: ["admin", "analytics", days, timezone],
    queryFn: () => getAdminAnalytics(days, timezone),
  });
  const data = query.data;
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "fr-FR", {
      timeZone: timezone,
      dateStyle: "medium",
    }).format(new Date(iso));
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={ChartNoAxesCombined}>
          <Localized>{t("messages.usageAnalytics")}</Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.registrationsActiveUsersAndSuccessfulOrganizationActions",
            )}
          </Localized>
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <label className="space-y-2 text-sm">
          <Localized>{t("messages.period")}</Localized>
          <Select
            value={String(days)}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[7, 30, 90].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value} <Localized>{t("messages.lastDays")}</Localized>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <Localized>{t("messages.timeZone2")}</Localized>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button variant="outline" onClick={() => void query.refetch()}>
          <RefreshCw />
          <Localized>{t("common.refresh")}</Localized>
        </Button>
      </div>
      {showQuerySkeleton(query) ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : query.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger les statistiques."
        >
          <Button variant="outline" onClick={() => void query.refetch()}>
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : (
        data && (
          <>
            <p className="text-sm text-muted-foreground">
              Du {date(data.start)} au {date(data.end)}{" "}
              <Localized>{t("messages.comparedWith")}</Localized>{" "}
              {date(data.previousStart)} au{" "}
              {date(new Date(Date.parse(data.previousEnd) - 1).toISOString())}
              <Localized>{t("messages.todayIsNotYetComplete")}</Localized>
            </p>
            <div className="rounded-xl border bg-blue-50/60 p-4 text-sm dark:bg-blue-950/30">
              <p className="font-medium">
                <Localized>{t("messages.howActivityIsMeasured")}</Localized>
              </p>
              <p className="mt-1 text-muted-foreground">
                <Localized>
                  {t(
                    "messages.anActiveUserHasSuccessfullyOrganizedSomethingAfterSigning",
                  )}
                </Localized>{" "}
                {date(data.measurementStartedAt)}{" "}
                <Localized>
                  {t("messages.earlierDatesAreNotReconstructed")}
                </Localized>
              </p>
              {!data.activityComplete && (
                <p className="mt-2 text-muted-foreground">
                  <Localized>
                    {t(
                      "messages.thisMeasurementOnlyPartiallyCoversTheSelectedPeriod",
                    )}
                  </Localized>
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  key: "signups" as const,
                  label: t("messages.registrations"),
                  icon: UserPlus,
                  tone: "from-violet-100 dark:from-violet-950",
                },
                {
                  key: "activeUsers" as const,
                  label: t("messages.distinctActiveUsers"),
                  icon: Users,
                  tone: "from-blue-100 dark:from-blue-950",
                },
                {
                  key: "actions" as const,
                  label: t("messages.successfulActions"),
                  icon: MousePointerClick,
                  tone: "from-emerald-100 dark:from-emerald-950",
                },
              ].map(({ key, label, icon: Icon, tone }) => {
                const metric = data.summary[key];
                return (
                  <article
                    key={key}
                    className={`rounded-xl border bg-gradient-to-br ${tone} to-card p-5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-medium">
                        <Localized>{label}</Localized>
                      </h2>
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <p className="mt-3 text-3xl font-semibold tabular-nums">
                      {metric.current}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {metric.previous === null
                        ? t("messages.comparisonUnavailableActivityWasNotMeasured")
                        : `${metric.change! > 0 ? "+" : ""}${metric.change} par rapport à ${metric.previous} précédemment${metric.percent !== null ? ` (${metric.percent > 0 ? "+" : ""}${metric.percent} %)` : t("messages.percentageCannotBeCalculatedFromZero")}`}
                    </p>
                  </article>
                );
              })}
            </div>
            <LineChart
              title={t("messages.dailyRegistrations")}
              description={t(
                "messages.existingAccountsGroupedByRegistrationDateInTheSelected",
              )}
              color="var(--chart-1)"
              data={data.series.map((row) => ({
                label: row.date,
                value: row.signups,
              }))}
            />
            {data.series.some((row) => row.activeUsers !== null) ? (
              <LineChart
                title={t("messages.dailyActiveUsersAndActions")}
                description={t(
                  "messages.anAccountCountsOncePerDayPeriodTotalsAlso",
                )}
                series={[
                  {
                    name: "Utilisateurs actifs",
                    color: "var(--chart-2)",
                    data: data.series
                      .filter((row) => row.activeUsers !== null)
                      .map((row) => ({
                        label: row.date,
                        value: row.activeUsers!,
                      })),
                  },
                  {
                    name: t("messages.successfulActions"),
                    color: "var(--chart-3)",
                    data: data.series
                      .filter((row) => row.actions !== null)
                      .map((row) => ({ label: row.date, value: row.actions! })),
                  },
                ]}
              />
            ) : (
              <FeedbackState
                description={t(
                  "messages.activityMeasurementHasNotStartedForThisPeriod",
                )}
              />
            )}
          </>
        )
      )}
    </div>
  );
}
