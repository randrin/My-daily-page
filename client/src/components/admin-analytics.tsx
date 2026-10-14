"use client";
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
  const [days, setDays] = useState(30),
    [timezone, setTimezone] = useState("Europe/Paris");
  const query = useQuery({
    queryKey: ["admin", "analytics", days, timezone],
    queryFn: () => getAdminAnalytics(days, timezone),
  });
  const data = query.data;
  const date = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: timezone,
      dateStyle: "medium",
    }).format(new Date(iso));
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={ChartNoAxesCombined}>Statistiques d’utilisation</PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscriptions, utilisateurs actifs et actions d’organisation réussies.
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <label className="space-y-2 text-sm">
          Période
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
                  {value} derniers jours
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          Fuseau horaire
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
          Actualiser
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
            Réessayer
          </Button>
        </FeedbackState>
      ) : (
        data && (
          <>
            <p className="text-sm text-muted-foreground">
              Du {date(data.start)} au {date(data.end)} · comparaison du{" "}
              {date(data.previousStart)} au{" "}
              {date(new Date(Date.parse(data.previousEnd) - 1).toISOString())}.
              La journée en cours est partielle.
            </p>
            <div className="rounded-xl border bg-blue-50/60 p-4 text-sm dark:bg-blue-950/30">
              <p className="font-medium">Comment l’activité est mesurée</p>
              <p className="mt-1 text-muted-foreground">
                Un utilisateur actif a réalisé dans l’application, après
                authentification, au moins une action d’organisation réussie :
                tâche, note, rappel, catégorie, modèle ou confirmation d’une
                proposition. Une connexion ou une consultation seule ne compte
                pas. L’activité est mesurée depuis le{" "}
                {date(data.measurementStartedAt)} ; les dates antérieures ne
                sont pas reconstituées.
              </p>
              {!data.activityComplete && (
                <p className="mt-2 text-muted-foreground">
                  La période choisie n’est que partiellement couverte par cette
                  mesure.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  key: "signups" as const,
                  label: "Inscriptions",
                  icon: UserPlus,
                  tone: "from-violet-100 dark:from-violet-950",
                },
                {
                  key: "activeUsers" as const,
                  label: "Utilisateurs actifs distincts",
                  icon: Users,
                  tone: "from-blue-100 dark:from-blue-950",
                },
                {
                  key: "actions" as const,
                  label: "Actions réussies",
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
                      <h2 className="text-sm font-medium">{label}</h2>
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <p className="mt-3 text-3xl font-semibold tabular-nums">
                      {metric.current}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {metric.previous === null
                        ? "Comparaison indisponible : historique non mesuré"
                        : `${metric.change! > 0 ? "+" : ""}${metric.change} par rapport à ${metric.previous} précédemment${metric.percent !== null ? ` (${metric.percent > 0 ? "+" : ""}${metric.percent} %)` : " · pourcentage non calculable depuis zéro"}`}
                    </p>
                  </article>
                );
              })}
            </div>
            <LineChart
              title="Inscriptions par jour"
              description="Comptes encore présents, regroupés selon leur date d’inscription dans le fuseau choisi."
              color="var(--chart-1)"
              data={data.series.map((row) => ({
                label: row.date,
                value: row.signups,
              }))}
            />
            {data.series.some((row) => row.activeUsers !== null) ? (
              <LineChart
                title="Utilisateurs actifs et actions par jour"
                description="Un compte est compté une fois par jour ; le total de la période déduplique aussi les comptes actifs plusieurs jours. Les jours non mesurés sont omis."
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
                    name: "Actions réussies",
                    color: "var(--chart-3)",
                    data: data.series
                      .filter((row) => row.actions !== null)
                      .map((row) => ({ label: row.date, value: row.actions! })),
                  },
                ]}
              />
            ) : (
              <FeedbackState description="La mesure d’activité n’a pas encore démarré sur cette période." />
            )}
          </>
        )
      )}
    </div>
  );
}
