"use client";
import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { useState } from "react";
import { AdminRoleAction } from "@/components/admin-role-action";
import { AdminAccountAction } from "@/components/admin-account-action";
import { useQuery } from "@tanstack/react-query";
import {
  RotateCcw,
  ShieldCheck,
  Users,
  UserRound,
  UserPlus,
  Bell,
  BellOff,
  Sun,
  Moon,
  ListTodo,
  CircleCheck,
  TriangleAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarDays,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toggleSort, type SortState } from "@/lib/table-sort";
const columns = [
  { key: "name", label: "messages.user" },
  { key: "role", label: "messages.role" },
  { key: "createdAt", label: "messages.signUp" },
  { key: "timezone", label: "messages.timeZone2" },
  { key: "tasks", label: "navigation.tasks" },
  { key: "completedTasks", label: "messages.done2" },
  { key: "notificationsEnabled", label: "messages.reminders2" },
  { key: "dailyDigestEnabled", label: "messages.morningSummary" },
] as const;
type SortKey = (typeof columns)[number]["key"];
function NotificationBadge({
  enabled,
  morning = false,
}: {
  enabled: boolean;
  morning?: boolean;
}) {
  const t = useTranslator();
  const Icon = morning ? (enabled ? Sun : Moon) : enabled ? Bell : BellOff;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {enabled ? t("messages.enabled2") : t("messages.disabled2")}
    </span>
  );
}
import { adminApi } from "@/api/admin";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminScreen() {
  const { locale } = useLocale();
  const t = useTranslator();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [account, setAccount] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<SortState<SortKey>>({
    key: "createdAt",
    direction: "desc",
  });
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.overview,
    retry: false,
  });
  const users = useQuery({
    queryKey: [
      "admin",
      "users",
      { search, role, account, page, pageSize, sort },
    ],
    queryFn: () =>
      adminApi.users({
        search,
        role,
        account,
        page,
        pageSize,
        sortBy: sort.key,
        sortDirection: sort.direction,
      }),
    retry: false,
  });
  const stats = overview.data;
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={ShieldCheck}>
          <Localized>
            <Localized>{"navigation.administration"}</Localized>
          </Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.overviewOfAccountsAndUsageAdministratorOrReadOnly",
            )}
          </Localized>
        </p>
      </header>
      {showQuerySkeleton(overview) ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : overview.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger les indicateurs."
        >
          <Button variant="outline" onClick={() => void overview.refetch()}>
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : (
        stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                label: "Utilisateurs inscrits",
                value: stats.users,
                icon: Users,
                tone: "from-blue-100 via-blue-50 to-white border-blue-200 text-blue-950 dark:from-blue-950 dark:via-blue-950/50 dark:to-card dark:border-blue-900 dark:text-blue-100",
              },
              {
                label: "Inscriptions sur 30 jours",
                value: stats.newUsers,
                icon: UserPlus,
                tone: "from-violet-100 via-violet-50 to-white border-violet-200 text-violet-950 dark:from-violet-950 dark:via-violet-950/50 dark:to-card dark:border-violet-900 dark:text-violet-100",
              },
              {
                label: t("messages.remindersEnabled"),
                value: stats.notificationsEnabled,
                icon: Bell,
                tone: "from-amber-100 via-amber-50 to-white border-amber-200 text-amber-950 dark:from-amber-950 dark:via-amber-950/50 dark:to-card dark:border-amber-900 dark:text-amber-100",
              },
              {
                label: t("messages.tasksCreated"),
                value: stats.tasks,
                icon: ListTodo,
                tone: "from-cyan-100 via-cyan-50 to-white border-cyan-200 text-cyan-950 dark:from-cyan-950 dark:via-cyan-950/50 dark:to-card dark:border-cyan-900 dark:text-cyan-100",
              },
              {
                label: t("messages.tasksCompleted"),
                value: stats.completedTasks,
                icon: CircleCheck,
                tone: "from-emerald-100 via-emerald-50 to-white border-emerald-200 text-emerald-950 dark:from-emerald-950 dark:via-emerald-950/50 dark:to-card dark:border-emerald-900 dark:text-emerald-100",
              },
              {
                label: t("messages.failedReminders"),
                value: stats.failedReminders,
                icon: TriangleAlert,
                tone: "from-rose-100 via-rose-50 to-white border-rose-200 text-rose-950 dark:from-rose-950 dark:via-rose-950/50 dark:to-card dark:border-rose-900 dark:text-rose-100",
              },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-sm",
                  tone,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium opacity-80">
                    <Localized>{label}</Localized>
                  </p>
                  <span className="rounded-lg bg-white/50 p-2 dark:bg-white/10">
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )
      )}
      <section
        className="space-y-4 rounded-xl border bg-card p-4 sm:p-5"
        aria-labelledby="admin-users-title"
      >
        <h2
          id="admin-users-title"
          className="flex items-center gap-2 font-semibold"
        >
          <Users className="size-5" aria-hidden />
          <Localized>{t("navigation.users")}</Localized>
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="admin-search" className="mb-2 block text-sm">
              <Localized>{t("messages.search")}</Localized>
            </label>
            <Input
              id="admin-search"
              placeholder={t("messages.lastNameFirstNameOrEmail")}
              maxLength={100}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label htmlFor="admin-role" className="mb-2 block text-sm">
              <Localized>{t("messages.role")}</Localized>
            </label>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger id="admin-role" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Localized>{t("messages.allRoles")}</Localized>
                </SelectItem>
                <SelectItem value="user">
                  <Localized>{t("messages.user")}</Localized>
                </SelectItem>
                <SelectItem value="support">
                  <Localized>{t("messages.supportReadOnly")}</Localized>
                </SelectItem>
                <SelectItem value="admin">
                  <Localized>{t("messages.administrator")}</Localized>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="admin-account" className="mb-2 block text-sm">
              <Localized>{t("messages.account2")}</Localized>
            </label>
            <Select
              value={account}
              onValueChange={(value) => {
                setAccount(value);
                setPage(1);
              }}
            >
              <SelectTrigger id="admin-account" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Localized>{t("messages.allAccounts")}</Localized>
                </SelectItem>
                <SelectItem value="active">
                  <Localized>{t("messages.active")}</Localized>
                </SelectItem>
                <SelectItem value="suspended">
                  <Localized>{t("messages.suspended")}</Localized>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search || role !== "all" || account !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setRole("all");
                setAccount("all");
                setPage(1);
              }}
            >
              <RotateCcw aria-hidden />
              <Localized>{t("common.reset")}</Localized>
            </Button>
          )}
        </div>
        {showQuerySkeleton(users) ? (
          <div className="space-y-3" aria-label="Chargement des utilisateurs">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : users.isError ? (
          <FeedbackState
            variant="error"
            description={t(
              "messages.unableToLoadUsersCheckYourAdministratorAccess",
            )}
          >
            <Button variant="outline" onClick={() => void users.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : !users.data?.items.length ? (
          <FeedbackState
            icon={Users}
            description="Aucun utilisateur ne correspond aux filtres."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="border-b">
                    {columns.map(({ key, label }) => {
                      const Icon =
                        sort.key === key
                          ? sort.direction === "asc"
                            ? ArrowUp
                            : ArrowDown
                          : ArrowUpDown;
                      return (
                        <th
                          className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                          key={key}
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
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      <Localized>{t("messages.account2")}</Localized>
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      <Localized>
                        <Localized>{"messages.actions"}</Localized>
                      </Localized>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.items.map((user) => (
                    <tr
                      className="border-b last:border-0 transition-colors hover:bg-muted/40"
                      key={user.id}
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-medium">
                          {[user.firstName, user.lastName]
                            .filter(Boolean)
                            .join(" ") || t("messages.nameNotProvided")}
                        </p>
                        <p
                          className="max-w-56 truncate text-sm text-muted-foreground"
                          title={user.email}
                        >
                          {user.email}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                            user.role === "admin"
                              ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
                              : user.role === "support"
                                ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
                          )}
                        >
                          {user.role === "admin" ? (
                            <ShieldCheck className="size-3.5" aria-hidden />
                          ) : (
                            <UserRound className="size-3.5" aria-hidden />
                          )}
                          {user.role === "admin"
                            ? t("messages.administrator")
                            : user.role === "support"
                              ? "Support"
                              : t("messages.user")}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 text-muted-foreground underline decoration-dotted underline-offset-4"
                            >
                              <CalendarDays className="size-3.5" aria-hidden />
                              <time dateTime={user.createdAt}>
                                {formatDistanceToNow(new Date(user.createdAt), {
                                  locale: locale === "en" ? enUS : fr,
                                  addSuffix: true,
                                })}
                              </time>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {new Intl.DateTimeFormat(
                              locale === "en" ? "en-US" : "fr-FR",
                              {
                                timeZone: "Europe/Paris",
                                dateStyle: "long",
                                timeStyle: "short",
                              },
                            ).format(new Date(user.createdAt))}{" "}
                            <Localized>{"messages.europeParis"}</Localized>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {user.timezone}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-medium tabular-nums">
                          {user.tasks}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                          {user.completedTasks}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <NotificationBadge
                          enabled={user.notificationsEnabled}
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <NotificationBadge
                          enabled={user.dailyDigestEnabled}
                          morning
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium",
                            user.suspendedAt
                              ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          )}
                        >
                          {user.suspendedAt ? t("messages.suspended") : t("messages.active")}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <AdminAccountAction user={user} />
                          <AdminRoleAction user={user} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={users.data.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
        <p className="text-xs text-muted-foreground">
          <Localized>
            {t(
              "messages.figuresCoverTheEntirePeriodNoTaskTitlesDescriptions",
            )}
          </Localized>
        </p>
      </section>
    </div>
  );
}
