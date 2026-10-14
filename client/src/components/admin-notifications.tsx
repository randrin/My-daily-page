"use client";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  CheckCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw,
  Server,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { adminNotificationsApi } from "@/api/admin-notifications";
import { useMe } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { sortBy, toggleSort, type SortState } from "@/lib/table-sort";
const channels: Record<string, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  PUSH: "Push",
};
const statuses: Record<string, string> = {
  accepted: "Accepté par le fournisseur",
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  failed: "Échec",
  complained: "Signalé",
  grouped: "Regroupé en digest",
  pending: "En attente",
  sending: "En cours / à vérifier",
  cancelled: "Annulé",
};
const providers: Record<string, string> = {
  resend: "Resend",
  twilio: "Twilio",
  ultramsg: "UltraMsg",
  push: "Web Push",
  unknown: "Non identifié",
};
function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${["failed", "complained"].includes(value) ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : ["delivered", "read"].includes(value) ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}
    >
      {statuses[value] ?? value}
    </span>
  );
}
function SortHeader({
  column,
  label,
  sort,
  onSort,
}: {
  column: string;
  label: string;
  sort: SortState<string> | null;
  onSort: (key: string) => void;
}) {
  const active = sort?.key === column;
  const Icon = active
    ? sort.direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;
  return (
    <th
      className="p-3 text-left whitespace-nowrap"
      aria-sort={
        active
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => onSort(column)}
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
      </button>
    </th>
  );
}
export function AdminNotifications() {
  const [days, setDays] = useState(7),
    [channel, setChannel] = useState("all"),
    [provider, setProvider] = useState("all"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10),
    [retryId, setRetryId] = useState<string>();
  const [groupChannel, setGroupChannel] = useState("all");
  const [groupProvider, setGroupProvider] = useState("all");
  const [groupStatus, setGroupStatus] = useState("all");
  const hasGroupFilters =
    groupChannel !== "all" || groupProvider !== "all" || groupStatus !== "all";
  const resetGroupFilters = () => {
    setGroupChannel("all");
    setGroupProvider("all");
    setGroupStatus("all");
  };
  const [failureChannel, setFailureChannel] = useState("all");
  const [failureProvider, setFailureProvider] = useState("all");
  const [failureStatus, setFailureStatus] = useState("all");
  const hasFailureFilters =
    failureChannel !== "all" ||
    failureProvider !== "all" ||
    failureStatus !== "all";
  const resetFailureFilters = () => {
    setFailureChannel("all");
    setFailureProvider("all");
    setFailureStatus("all");
    setPage(1);
  };
  const [groupSort, setGroupSort] = useState<SortState<string> | null>(null);
  const [failureSort, setFailureSort] = useState<SortState<string>>({
    key: "triggerAt",
    direction: "desc",
  });
  const me = useMe();
  const cache = useQueryClient();
  const data = useQuery({
    queryKey: [
      "admin",
      "notifications",
      {
        days,
        channel,
        provider,
        page,
        pageSize,
        failureSort,
        failureChannel,
        failureProvider,
        failureStatus,
      },
    ],
    queryFn: () =>
      adminNotificationsApi.overview({
        days,
        channel,
        provider,
        page,
        pageSize,
        failureChannel: failureChannel === "all" ? undefined : failureChannel,
        failureProvider:
          failureProvider === "all" ? undefined : failureProvider,
        failureStatus: failureStatus === "all" ? undefined : failureStatus,
        sortBy: failureSort.key,
        sortDirection: failureSort.direction,
      }),
    refetchInterval: 30000,
  });
  const queues = useQuery({
    queryKey: ["admin", "notification-queues"],
    queryFn: adminNotificationsApi.queues,
    refetchInterval: 30000,
    retry: false,
  });
  const retry = useMutation({
    mutationFn: adminNotificationsApi.retry,
    onSuccess: async () => {
      setRetryId(undefined);
      toast.success(
        "Réessai demandé. Le planificateur vérifiera les conditions d’envoi.",
      );
      await cache.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Réessai impossible")),
  });
  const groups = data.data?.groups ?? [];
  const filteredGroups = groups.filter(
    (row) =>
      (groupChannel === "all" || row.channel === groupChannel) &&
      (groupProvider === "all" || row.provider === groupProvider) &&
      (groupStatus === "all" || row.status === groupStatus),
  );
  const sortedGroups = sortBy(filteredGroups, groupSort, (row, key) => {
    switch (key) {
      case "channel":
        return channels[row.channel] ?? row.channel;
      case "provider":
        return providers[row.provider] ?? row.provider;
      case "status":
        return statuses[row.status] ?? row.status;
      case "count":
        return row.count;
      case "unitPrice":
        return row.unitPrice;
      case "estimatedCost":
        return row.estimatedCost;
      default:
        return null;
    }
  });
  const sum = (filter: (group: (typeof groups)[number]) => boolean) =>
    groups.filter(filter).reduce((n, row) => n + row.count, 0);
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={Activity}>Supervision notifications</PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Rappels, livraisons et fournisseurs · actualisation toutes les 30
          secondes.
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <label className="space-y-2 text-sm">
          Période
          <Select
            value={String(days)}
            onValueChange={(value) => {
              setDays(Number(value));
              setPage(1);
            }}
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
          Canal
          <Select
            value={channel}
            onValueChange={(value) => {
              setChannel(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les canaux</SelectItem>
              {Object.entries(channels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          Fournisseur
          <Select
            value={provider}
            onValueChange={(value) => {
              setProvider(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les fournisseurs</SelectItem>
              {Object.entries(providers).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {(days !== 7 || channel !== "all" || provider !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setDays(7);
              setChannel("all");
              setProvider("all");
              setPage(1);
            }}
          >
            <RotateCcw />
            Réinitialiser
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            void data.refetch();
            void queues.refetch();
          }}
        >
          <RefreshCw />
          Actualiser
        </Button>
      </div>
      {showQuerySkeleton(data) ? (
        <Skeleton className="h-44" />
      ) : data.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger la supervision."
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Période basée sur la date prévue du rappel, du{" "}
            {new Date(data.data!.start).toLocaleDateString("fr-FR")} au{" "}
            {new Date(data.data!.end).toLocaleDateString("fr-FR")}. Les
            confirmations de livraison dépendent des webhooks fournisseurs.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Rappels sur la période",
                icon: Bell,
                value: sum(() => true),
                tone: "from-blue-100 dark:from-blue-950",
              },
              {
                label: "Livrés / lus confirmés",
                icon: CheckCheck,
                value: sum((row) => ["delivered", "read"].includes(row.status)),
                tone: "from-emerald-100 dark:from-emerald-950",
              },
              {
                label: "Échecs / signalements",
                icon: TriangleAlert,
                value: sum((row) =>
                  ["failed", "complained"].includes(row.status),
                ),
                tone: "from-rose-100 dark:from-rose-950",
              },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className={`rounded-xl border bg-gradient-to-br ${tone} to-card p-5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-medium">{label}</h2>
                  <Icon className="size-5 shrink-0" aria-hidden />
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">
              Canaux, fournisseurs et coûts estimés
            </h2>
            <p className="text-sm text-muted-foreground">
              Estimation par rappel accepté, selon les tarifs configurés. Hors
              résumés email, abonnements, taxes et segmentation SMS. Ces
              montants ne sont pas une facture fournisseur.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              {[
                {
                  id: "cost-channel",
                  label: "Canal",
                  value: groupChannel,
                  setValue: setGroupChannel,
                  options: channels,
                  all: "Tous les canaux",
                },
                {
                  id: "cost-provider",
                  label: "Fournisseur",
                  value: groupProvider,
                  setValue: setGroupProvider,
                  options: providers,
                  all: "Tous les fournisseurs",
                },
                {
                  id: "cost-status",
                  label: "État",
                  value: groupStatus,
                  setValue: setGroupStatus,
                  options: statuses,
                  all: "Tous les états",
                },
              ].map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label htmlFor={filter.id} className="text-sm font-medium">
                    {filter.label}
                  </label>
                  <Select value={filter.value} onValueChange={filter.setValue}>
                    <SelectTrigger id={filter.id} className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{filter.all}</SelectItem>
                      {Object.entries(filter.options).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {hasGroupFilters && (
                <Button variant="outline" onClick={resetGroupFilters}>
                  <RotateCcw aria-hidden />
                  Réinitialiser
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ces filtres s’appliquent à ce tableau, dans la période et les
              filtres globaux sélectionnés.
            </p>
            {!sortedGroups.length ? (
              <FeedbackState
                description={
                  hasGroupFilters
                    ? "Aucun résultat pour ces filtres."
                    : "Aucun rappel sur cette période."
                }
              >
                {hasGroupFilters && (
                  <Button variant="outline" onClick={resetGroupFilters}>
                    <RotateCcw aria-hidden />
                    Réinitialiser
                  </Button>
                )}
              </FeedbackState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      {[
                        ["channel", "Canal"],
                        ["provider", "Fournisseur"],
                        ["status", "État"],
                        ["count", "Nombre"],
                        ["unitPrice", "Prix unitaire"],
                        ["estimatedCost", "Estimation"],
                      ].map(([key, label]) => (
                        <SortHeader
                          key={key}
                          column={key}
                          label={label}
                          sort={groupSort}
                          onSort={(column) =>
                            setGroupSort(toggleSort(groupSort, column))
                          }
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGroups.map((row) => (
                      <tr
                        key={`${row.channel}-${row.provider}-${row.status}`}
                        className="border-t"
                      >
                        <td className="p-3">
                          {channels[row.channel] ?? row.channel}
                        </td>
                        <td className="p-3">
                          {providers[row.provider] ?? row.provider}
                        </td>
                        <td className="p-3">
                          <Status value={row.status} />
                        </td>
                        <td className="p-3 tabular-nums">{row.count}</td>
                        <td className="p-3 whitespace-nowrap">
                          {row.unitPrice === null
                            ? "À configurer"
                            : `${row.unitPrice} ${data.data!.currency}`}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {row.estimatedCost === null
                            ? "—"
                            : `${row.estimatedCost.toLocaleString("fr-FR", { maximumFractionDigits: 6 })} ${data.data!.currency}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-5" />
              Échecs et envois à vérifier
            </h2>
            <p className="text-sm text-muted-foreground">
              Un réessai est disponible uniquement pour un échec connu avant
              envoi. Les acceptations, timeouts et livraisons incertaines
              nécessitent une vérification chez le fournisseur.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              {[
                {
                  id: "failure-channel",
                  label: "Canal",
                  value: failureChannel,
                  setValue: setFailureChannel,
                  options: channels,
                  all: "Tous les canaux",
                },
                {
                  id: "failure-provider",
                  label: "Fournisseur",
                  value: failureProvider,
                  setValue: setFailureProvider,
                  options: providers,
                  all: "Tous les fournisseurs",
                },
                {
                  id: "failure-status",
                  label: "État",
                  value: failureStatus,
                  setValue: setFailureStatus,
                  options: {
                    failed: statuses.failed,
                    complained: statuses.complained,
                    sending: statuses.sending,
                  },
                  all: "Tous les états",
                },
              ].map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label htmlFor={filter.id} className="text-sm font-medium">
                    {filter.label}
                  </label>
                  <Select
                    value={filter.value}
                    onValueChange={(value) => {
                      filter.setValue(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id={filter.id} className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{filter.all}</SelectItem>
                      {Object.entries(filter.options).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {hasFailureFilters && (
                <Button variant="outline" onClick={resetFailureFilters}>
                  <RotateCcw aria-hidden />
                  Réinitialiser
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ces filtres s’appliquent à tous les résultats de ce tableau, dans
              la période et les filtres globaux sélectionnés.
            </p>
            {!data.data!.failures.length ? (
              <FeedbackState
                description={
                  hasFailureFilters
                    ? "Aucun résultat pour ces filtres."
                    : "Aucun échec ni envoi à vérifier sur cette période."
                }
              >
                {hasFailureFilters && (
                  <Button variant="outline" onClick={resetFailureFilters}>
                    <RotateCcw aria-hidden />
                    Réinitialiser
                  </Button>
                )}
              </FeedbackState>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        {[
                          ["user", "Utilisateur"],
                          ["channel", "Canal"],
                          ["provider", "Fournisseur"],
                          ["status", "État"],
                          ["attempts", "Tentatives"],
                        ].map(([key, label]) => (
                          <SortHeader
                            key={key}
                            column={key}
                            label={label}
                            sort={failureSort}
                            onSort={(column) => {
                              setFailureSort(toggleSort(failureSort, column));
                              setPage(1);
                            }}
                          />
                        ))}
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data!.failures.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">
                              {[row.user.firstName, row.user.lastName]
                                .filter(Boolean)
                                .join(" ") || "Nom non renseigné"}
                            </p>
                            <p
                              className="max-w-64 truncate text-sm text-muted-foreground"
                              title={row.user.email}
                            >
                              {row.user.email}
                            </p>
                          </td>
                          <td className="p-3">{channels[row.channel]}</td>
                          <td className="p-3">
                            {providers[row.provider] ?? row.provider}
                          </td>
                          <td className="p-3">
                            <Status
                              value={
                                row.deliveryStatus ?? row.status.toLowerCase()
                              }
                            />
                            <p className="mt-1 max-w-64 text-xs text-muted-foreground">
                              {row.diagnostic}
                            </p>
                          </td>
                          <td className="p-3">{row.attempts}</td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                !row.retryEligible || me.data?.role !== "admin"
                              }
                              onClick={() => setRetryId(row.id)}
                            >
                              <RotateCcw />
                              Réessayer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DataPagination
                  page={page}
                  pageSize={pageSize}
                  total={data.data!.total}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                />
              </>
            )}
          </section>
        </>
      )}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Server className="size-5" />
          Files d’attente et workers
        </h2>
        <p className="text-sm text-muted-foreground">
          Instantané global, indépendant des filtres. Workers connectés ne
          signifie pas garantie de livraison.
        </p>
        {showQuerySkeleton(queues) ? (
          <Skeleton className="h-32" />
        ) : queues.isError ? (
          <FeedbackState
            variant="error"
            description="État des files indisponible."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {queues.data?.map((queue) => (
              <article
                key={queue.name}
                className="rounded-lg border p-4 space-y-2"
              >
                <h3 className="font-medium">{queue.name}</h3>
                {!queue.available ? (
                  <p className="text-destructive text-sm">
                    Redis ou file indisponible
                  </p>
                ) : (
                  <>
                    <p
                      className={
                        queue.workers
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }
                    >
                      {queue.workers} worker(s) connecté(s)
                    </p>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries({
                        waiting: "En attente",
                        delayed: "Différés",
                        active: "Actifs",
                        failed: "Échoués",
                        completed: "Terminés",
                      }).map(([key, label]) => (
                        <div key={key}>
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-semibold">
                            {queue.counts?.[key] ?? 0}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-xs text-muted-foreground">
                      Plus ancien en attente :{" "}
                      {queue.oldestEnqueuedAt
                        ? new Date(queue.oldestEnqueuedAt).toLocaleString(
                            "fr-FR",
                          )
                        : "—"}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <Dialog
        open={!!retryId}
        onOpenChange={(open) => {
          if (!open && !retry.isPending) setRetryId(undefined);
        }}
      >
        <DialogContent onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Réessayer ce rappel ?</DialogTitle>
            <DialogDescription>
              La demande sera auditée. L’envoi reprendra via le planificateur,
              en respectant le compte, le canal et les horaires autorisés. Aucun
              envoi direct n’est effectué par ce bouton.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={retry.isPending}
              onClick={() => setRetryId(undefined)}
            >
              Annuler
            </Button>
            <Button
              disabled={retry.isPending}
              onClick={() => retryId && retry.mutate(retryId)}
            >
              {retry.isPending ? "Enregistrement…" : "Confirmer le réessai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
