"use client";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, ArrowUp, ArrowDown, ScrollText } from "lucide-react";
import { getAdminAudit } from "@/api/admin";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { toggleSort, type SortState } from "@/lib/table-sort";
const columns = [
  { key: "action", label: "Action" },
  { key: "actorId", label: "Auteur" },
  { key: "target", label: "Compte concerné" },
  { key: "createdAt", label: "Date (Europe/Paris)" },
] as const;
type SortKey = (typeof columns)[number]["key"];
const labels: Record<string, string> = {
  "account.suspend": "Suspension de compte",
  "account.reactivate": "Réactivation de compte",
  "rights.change": "Modification des droits",
  "export.download": "Téléchargement d’export",
  "retention.policy": "Modification de la conservation",
  "retention.hold": "Exception de conservation",
  "retention.release": "Levée d’exception",
  "retention.preview": "Aperçu de purge",
  "retention.purge": "Purge supervisée",
  "export.request": "Demande d’export",
  "notification.retry": "Réessai de rappel",
  "mfa.enable": "Activation MFA",
  "mfa.disable": "Désactivation MFA",
  "mfa.recovery_used": "Code de récupération utilisé",
};
export function AdminAudit() {
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortState<SortKey>>({
    key: "createdAt",
    direction: "desc",
  });
  const audit = useQuery({
    queryKey: ["admin", "audit", page, pageSize, sort],
    queryFn: () => getAdminAudit(page, pageSize, sort.key, sort.direction),
    retry: false,
  });
  return (
    <section
      className="space-y-6"
      aria-labelledby="admin-audit-title"
    >
      <div>
        <PageTitle id="admin-audit-title" icon={ScrollText}>Journal d’audit</PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Historique des mutations administratives validées. Les comptes sont
          identifiés à partir de leur profil actuel ; les événements sont
          protégés contre la modification. Seule une purge supervisée peut
          supprimer les événements expirés non protégés par une exception.
        </p>
      </div>
      {showQuerySkeleton(audit) ? (
        <div className="space-y-2" aria-label="Chargement du journal">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : audit.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger le journal."
        >
          <Button variant="outline" onClick={() => void audit.refetch()}>
            Réessayer
          </Button>
        </FeedbackState>
      ) : !audit.data?.items.length ? (
        <FeedbackState
          icon={ScrollText}
          description="Aucune action administrative enregistrée. Les futures suspensions, réactivations et modifications de droits apparaîtront ici."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  {columns.map(({ key, label }) => {
                    const Icon =
                      sort.key === key
                        ? sort.direction === "asc"
                          ? ArrowUp
                          : ArrowDown
                        : ArrowUpDown;
                    return (
                      <th
                        key={key}
                        className="px-3 py-3 text-left font-medium whitespace-nowrap"
                        aria-sort={
                          sort.key === key
                            ? sort.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                          onClick={() => {
                            setSort(toggleSort(sort, key));
                            setPage(1);
                          }}
                        >
                          {label}
                          <Icon className="size-3.5" aria-hidden />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {audit.data.items.map((event) => (
                  <tr key={event.id} className="border-t hover:bg-muted/40">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {labels[event.action] ?? event.action}
                      {event.roleBefore && event.roleAfter && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.roleBefore} → {event.roleAfter}
                        </p>
                      )}
                      {event.action === "notification.retry" &&
                        event.resourceId && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            Rappel : {event.resourceId}
                          </p>
                        )}
                    </td>
                    <td className="px-3 py-3">
                      {event.actor ? (
                        <>
                          <p className="font-medium">
                            {[event.actor.firstName, event.actor.lastName]
                              .filter(Boolean)
                              .join(" ") || "Nom non renseigné"}
                          </p>
                          <p
                            className="max-w-64 truncate text-sm text-muted-foreground"
                            title={event.actor.email}
                          >
                            {event.actor.email}
                          </p>
                        </>
                      ) : event.actorId ? (
                        <>
                          <p className="text-muted-foreground">
                            Compte supprimé
                          </p>
                          <p className="font-mono text-xs">{event.actorId}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {event.target ? (
                        <>
                          <p className="font-medium">
                            {[event.target.firstName, event.target.lastName]
                              .filter(Boolean)
                              .join(" ") || "Nom non renseigné"}
                          </p>
                          <p
                            className="max-w-64 truncate text-sm text-muted-foreground"
                            title={event.target.email}
                          >
                            {event.target.email}
                          </p>
                        </>
                      ) : event.targetId ? (
                        <>
                          <p className="text-muted-foreground">
                            Compte supprimé
                          </p>
                          <p className="font-mono text-xs">{event.targetId}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <time dateTime={event.createdAt}>
                        {new Intl.DateTimeFormat("fr-FR", {
                          timeZone: "Europe/Paris",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(event.createdAt))}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataPagination
            page={page}
            pageSize={pageSize}
            total={audit.data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}
    </section>
  );
}
