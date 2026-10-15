"use client";
import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { startOfDay, addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ScrollText,
  Filter,
  RotateCcw,
} from "lucide-react";
import { getAdminAudit } from "@/api/admin";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { toggleSort, type SortState } from "@/lib/table-sort";
const columns = [
  { key: "action", label: "messages.action" },
  { key: "actorId", label: "messages.author" },
  { key: "target", label: "messages.affectedAccount" },
  { key: "createdAt", label: "messages.dateEuropeParis" },
] as const;
type SortKey = (typeof columns)[number]["key"];
const labels: Record<string, string> = {
  "account.suspend": "messages.accountSuspension",
  "account.reactivate": "messages.accountReactivation",
  "rights.change": "messages.permissionChange",
  "export.download": "messages.exportDownload",
  "retention.policy": "messages.retentionChange",
  "retention.hold": "messages.retentionHold",
  "retention.release": "messages.holdReleased",
  "retention.preview": "messages.purgePreview",
  "retention.purge": "messages.supervisedPurge",
  "export.request": "messages.exportRequest",
  "notification.retry": "messages.reminderRetry",
  "mfa.enable": "messages.enableMfa",
  "mfa.disable": "messages.disableMfa",
  "mfa.recovery_used": "messages.recoveryCodeUsed",
};
export function AdminAudit() {
  const { locale } = useLocale();
  const t = useTranslator();
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortState<SortKey>>({
    key: "createdAt",
    direction: "desc",
  });
  const [action, setAction] = useState("all");
  const [author, setAuthor] = useState("");
  const [account, setAccount] = useState("");
  const [search, setSearch] = useState({ author: "", account: "" });
  const [range, setRange] = useState<DateRange>();
  const filters = {
    action: action === "all" ? undefined : action,
    author: search.author || undefined,
    account: search.account || undefined,
    from: range?.from ? startOfDay(range.from).toISOString() : undefined,
    to: range?.from
      ? startOfDay(addDays(range.to ?? range.from, 1)).toISOString()
      : undefined,
  };
  const hasFilters =
    action !== "all" ||
    Boolean(
      author || account || range?.from || search.author || search.account,
    );
  const resetFilters = () => {
    setAction("all");
    setAuthor("");
    setAccount("");
    setSearch({ author: "", account: "" });
    setRange(undefined);
    setPage(1);
  };
  const audit = useQuery({
    queryKey: ["admin", "audit", page, pageSize, sort, filters],
    queryFn: () =>
      getAdminAudit(page, pageSize, sort.key, sort.direction, filters),
    retry: false,
  });
  return (
    <section className="space-y-6" aria-labelledby="admin-audit-title">
      <div>
        <PageTitle id="admin-audit-title" icon={ScrollText}>
          <Localized>{t("navigation.audit")}</Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.historyOfConfirmedAdministrativeChangesAccountsUseTheirCurrent",
            )}
          </Localized>
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch({ author: author.trim(), account: account.trim() });
          setPage(1);
        }}
      >
        <div className="space-y-2">
          <label htmlFor="audit-action" className="block text-sm font-medium">
            {t("messages.action")}
          </label>
          <Select
            value={action}
            onValueChange={(value) => {
              setAction(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="audit-action" className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("audit.filters.allActions")}
              </SelectItem>
              {Object.entries(labels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {t(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="audit-author" className="block text-sm font-medium">
            {t("messages.author")}
          </label>
          <Input
            id="audit-author"
            className="w-60"
            value={author}
            maxLength={100}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("audit.filters.identity")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="audit-account" className="block text-sm font-medium">
            {t("messages.affectedAccount")}
          </label>
          <Input
            id="audit-account"
            className="w-60"
            value={account}
            maxLength={100}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={t("audit.filters.identity")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="audit-period" className="block text-sm font-medium">
            {t("audit.filters.period")}
          </label>
          <DateRangePicker
            id="audit-period"
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
            placeholder={t("audit.filters.choosePeriod")}
          />
        </div>
        <Button type="submit" variant="outline">
          <Filter aria-hidden />
          {t("audit.filters.apply")}
        </Button>
        {hasFilters && (
          <Button type="button" variant="outline" onClick={resetFilters}>
            <RotateCcw aria-hidden />
            {t("common.reset")}
          </Button>
        )}
      </form>
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
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : !audit.data?.items.length ? (
        <FeedbackState
          icon={ScrollText}
          description={t(
            hasFilters
              ? "audit.filters.empty"
              : "messages.noAdministrativeActionsYetFutureSuspensionsReactivationsAndPermission",
          )}
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
                          <Localized>{label}</Localized>
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
                      <Localized>
                        {labels[event.action] ?? event.action}
                      </Localized>
                      {event.roleBefore && event.roleAfter && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.roleBefore} → {event.roleAfter}
                        </p>
                      )}
                      {event.action === "notification.retry" &&
                        event.resourceId && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            <Localized>{t("messages.reminder")}</Localized>
                            {event.resourceId}
                          </p>
                        )}
                    </td>
                    <td className="px-3 py-3">
                      {event.actor ? (
                        <>
                          <p className="font-medium">
                            {[event.actor.firstName, event.actor.lastName]
                              .filter(Boolean)
                              .join(" ") || t("messages.nameNotProvided")}
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
                            <Localized>
                              {t("messages.deletedAccount")}
                            </Localized>
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
                              .join(" ") || t("messages.nameNotProvided")}
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
                            <Localized>
                              {t("messages.deletedAccount")}
                            </Localized>
                          </p>
                          <p className="font-mono text-xs">{event.targetId}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <time dateTime={event.createdAt}>
                        {new Intl.DateTimeFormat(
                          locale === "en" ? "en-US" : "fr-FR",
                          {
                            timeZone: "Europe/Paris",
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        ).format(new Date(event.createdAt))}
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
