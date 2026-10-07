"use client";

import { FeedbackState } from "@/components/ui/feedback-state";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowDown, ArrowUp, ArrowUpDown, LayoutGrid, List, X, Ban, CalendarClock, CheckCircle2, Clock3, Mail, MessageCircle, MessageSquare, Send, TriangleAlert, type LucideIcon } from "lucide-react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { cn } from "@/lib/utils";

const reminderSchema = z.object({
  id: z.string(), channel: z.string(), status: z.string(), triggerAt: z.coerce.date(),
  sentAt: z.coerce.date().nullable(), attempts: z.number().optional(), lastError: z.string().nullable().optional(),
  task: z.object({ title: z.string() }).optional(),
});

const statuses: Record<string, { label: string; icon: LucideIcon; row: string; badge: string }> = {
  PENDING: { label: "Planifié", icon: CalendarClock, row: "border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/25", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200" },
  SENDING: { label: "Envoi en cours / à vérifier", icon: Send, row: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/25", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200" },
  SENT: { label: "Accepté par le fournisseur", icon: CheckCircle2, row: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/25", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200" },
  FAILED: { label: "Échec", icon: TriangleAlert, row: "border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/30", badge: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200" },
  CANCELLED: { label: "Annulé", icon: Ban, row: "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/25", badge: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200" },
};
const channels: Record<string, { label: string; icon: LucideIcon }> = {
  email: { label: "Email", icon: Mail }, sms: { label: "SMS", icon: MessageSquare }, whatsapp: { label: "WhatsApp", icon: MessageCircle },
};

const sortColumns = [
  { key: "title", label: "Tâche" },
  { key: "channel", label: "Canal" },
  { key: "triggerAt", label: "Date du rappel" },
  { key: "status", label: "Statut d’envoi" },
  { key: "attempts", label: "Tentatives" },
  { key: "lastError", label: "Erreur" },
] as const;
type SortKey = (typeof sortColumns)[number]["key"];

export function ReminderHistory() {
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "triggerAt", direction: "desc" });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const query = useQuery({ queryKey: ["reminder-history", channelFilter, statusFilter, sort, page, pageSize], queryFn: async () => {
    const { data } = await apiClient.get("/notifications/history", { params: {
      page, pageSize, sortBy: sort.key, direction: sort.direction,
      channel: channelFilter === "all" ? undefined : channelFilter.toUpperCase(),
      status: statusFilter === "all" ? undefined : statusFilter,
    } });
    return z.object({ items: z.array(reminderSchema), total: z.number(), page: z.number(), pageSize: z.number(), pageCount: z.number() }).parse(data);
  }, refetchInterval: 15000 });
  const sortedReminders = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const resultsClassName = viewMode === "grid" ? "grid grid-cols-1 gap-3" : "space-y-3";
  const hasFilters = channelFilter !== "all" || statusFilter !== "all";
  return <Card>
    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
      <CardTitle>Historique des rappels</CardTitle>
      <div className="flex items-center gap-1 rounded-md border p-1" role="group" aria-label="Affichage des rappels">
        <Button type="button" variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="h-7" aria-label="Vue liste" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}><List className="size-4" /></Button>
        <Button type="button" variant={viewMode === "grid" ? "default" : "ghost"} size="sm" className="h-7" aria-label="Vue grille" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><LayoutGrid className="size-4" /></Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="reminder-channel">Canal</Label>
          <Select value={channelFilter} onValueChange={(value) => { setChannelFilter(value); setPage(1); }}>
            <SelectTrigger id="reminder-channel" className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les canaux</SelectItem>
              {Object.entries(channels).map(([value, channel]) => <SelectItem key={value} value={value}>{channel.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-status">Statut d’envoi</Label>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger id="reminder-status" className="w-full sm:w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statuses).map(([value, status]) => <SelectItem key={value} value={value}>{status.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasFilters ? <Button type="button" variant="ghost" onClick={() => { setChannelFilter("all"); setStatusFilter("all"); setPage(1); }}><X className="size-4" />Réinitialiser</Button> : null}
      </div>
      {!showQuerySkeleton(query) && !query.isError ? <p className="text-sm text-muted-foreground" role="status">{total} {total === 1 ? "rappel" : "rappels"}</p> : null}
      {showQuerySkeleton(query) ? <div className={resultsClassName}>{viewMode === "list" ? <div className="grid grid-cols-6 gap-4 rounded-lg border bg-muted/50 p-4">{[0, 1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-4" />)}</div> : null}{[0, 1, 2].map((key) => <Skeleton key={key} className={cn("w-full rounded-xl", viewMode === "grid" ? "h-24" : "h-14")} />)}</div> : query.isError ? <FeedbackState variant="error" description="Impossible de charger les rappels."><Button variant="outline" onClick={() => void query.refetch()}>Réessayer</Button></FeedbackState> : !total ? <FeedbackState description={hasFilters ? "Aucun rappel ne correspond à ces filtres." : "Aucun rappel planifié. Active un canal pour tes prochaines échéances."} /> : viewMode === "list" ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Historique des rappels filtrés</caption>
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>{sortColumns.map(({ key, label }) => {
                const active = sort.key === key;
                const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                return <th key={key} scope="col" aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className="whitespace-nowrap px-4 py-3 font-medium">
                  <button type="button" className="inline-flex items-center gap-2 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => { setSort({ key, direction: active && sort.direction === "asc" ? "desc" : "asc" }); setPage(1); }}>
                    {label}<SortIcon className="size-4" aria-hidden="true" />
                  </button>
                </th>;
              })}</tr>
            </thead>
            <tbody className="divide-y">
              {sortedReminders.map((reminder) => {
                const status = statuses[reminder.status] ?? { label: reminder.status, icon: Clock3, row: "bg-muted/30", badge: "bg-muted text-muted-foreground" };
                const channel = channels[reminder.channel] ?? { label: reminder.channel, icon: Send };
                const StatusIcon = status.icon;
                const ChannelIcon = channel.icon;
                return <tr key={reminder.id}>
                  <th scope="row" className="min-w-48 px-4 py-3 font-semibold">{reminder.task?.title ?? "Tâche"}</th>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><ChannelIcon className="size-4" aria-hidden="true" />{channel.label}</span></td>
                  <td className="whitespace-nowrap px-4 py-3"><time dateTime={reminder.triggerAt.toISOString()}>{reminder.triggerAt.toLocaleString("fr-FR")}</time></td>
                  <td className="px-4 py-3"><span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", status.badge)}><StatusIcon className="size-3.5" aria-hidden="true" />{status.label}</span></td>
                  <td className="px-4 py-3 tabular-nums">{reminder.attempts ?? 0}</td>
                  <td className="min-w-40 max-w-80 break-words px-4 py-3 text-xs text-destructive">{reminder.lastError ?? "—"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      ) :
        <ul className={resultsClassName}>{sortedReminders.map((reminder) => {
          const status = statuses[reminder.status] ?? { label: reminder.status, icon: Clock3, row: "border-border bg-muted/30", badge: "bg-muted text-muted-foreground" };
          const channel = channels[reminder.channel] ?? { label: reminder.channel, icon: Send };
          const StatusIcon = status.icon;
          const ChannelIcon = channel.icon;
          const attempts = reminder.attempts ?? 0;
          return <li key={reminder.id} className={cn("rounded-xl border p-4 text-sm", status.row)}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 space-y-2">
                <p className="break-words font-semibold">{reminder.task?.title ?? "Tâche"}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><ChannelIcon className="size-3.5" aria-hidden="true" />{channel.label}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" /><time dateTime={reminder.triggerAt.toISOString()}>{reminder.triggerAt.toLocaleString("fr-FR")}</time></span>
                  <span>{attempts} {attempts === 1 ? "tentative" : "tentatives"}</span>
                </div>
              </div>
              <span className={cn("inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", status.badge)}>
                <StatusIcon className="size-3.5 shrink-0" aria-hidden="true" />{status.label}
              </span>
            </div>
            {reminder.lastError ? <p className="mt-3 break-words border-t border-current/10 pt-3 text-xs text-destructive">{reminder.lastError}</p> : null}
          </li>;
        })}</ul>}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="reminder-page-size">Par page</Label>
          <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
            <SelectTrigger id="reminder-page-size"><SelectValue /></SelectTrigger>
            <SelectContent>{[10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled={!query.data || query.data.page <= 1 || query.isFetching} onClick={() => setPage((query.data?.page ?? 1) - 1)}>Précédent</Button>
          <span className="text-sm" aria-live="polite">Page {query.data?.page ?? page} sur {query.data?.pageCount ?? "…"}</span>
          <Button variant="outline" disabled={!query.data || query.data.page >= query.data.pageCount || query.isFetching} onClick={() => setPage((query.data?.page ?? 1) + 1)}>Suivant</Button>
        </div>
      </div>
    </CardContent>
  </Card>;
}
