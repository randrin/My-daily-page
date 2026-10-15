"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Archive,
  Download,
  FileDown,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Trash2,
  LockKeyholeOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminDataApi,
  exportFilterSchema,
  retentionHoldSchema,
  retentionPolicySchema,
  type PurgePlan,
} from "@/api/admin-data";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useMe } from "@/hooks/use-profile";
import { AdminDataProof, type DataAction } from "./admin-data-proof";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { DataPagination } from "@/components/ui/data-pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
function Choice({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        <Localized>{label}</Localized>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={`text-sm font-medium ${error ? "text-destructive" : ""}`}
      >
        <Localized>{label}</Localized>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          <Localized>{error}</Localized>
        </p>
      )}
    </div>
  );
}
const typeLabels = {
  audit: "navigation.audit",
  reminders: "messages.reminders2",
  exports: "messages.exports2",
} as const;
export function AdminData() {
  const t = useTranslator();
  const me = useMe(),
    cache = useQueryClient();
  const [tab, setTab] = useState("exports"),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10),
    [range, setRange] = useState<DateRange>(),
    [role, setRole] = useState("all"),
    [account, setAccount] = useState("all"),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [action, setAction] = useState<DataAction>(),
    [plan, setPlan] = useState<PurgePlan>();
  const [policyDraft, setPolicyDraft] = useState<{
      auditDays: number;
      reminderDays: number;
      exportDays: number;
    }>(),
    [holdType, setHoldType] = useState<"audit" | "reminders" | "exports">(
      "audit",
    ),
    [holdId, setHoldId] = useState(""),
    [reason, setReason] = useState("");
  const exports = useQuery({
    queryKey: ["admin", "exports", page, pageSize],
    queryFn: () => adminDataApi.exports(page, pageSize),
    refetchInterval: 30000,
    retry: false,
  });
  const retention = useQuery({
    queryKey: ["admin", "retention"],
    queryFn: adminDataApi.retention,
    retry: false,
  });
  const preview = useMutation({
    mutationFn: adminDataApi.preview,
    onSuccess: setPlan,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t("messages.previewUnavailable"))),
  });
  const download = useMutation({
    mutationFn: async (id: string) => {
      const blob = await adminDataApi.download(id),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `comptes-${id}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          t("messages.exportExpiredOrDownloadFailed"),
        ),
      ),
  });
  const policy = policyDraft ?? retention.data?.policy;
  function validateExport(only?: string) {
    const input = {
      from: range?.from?.toISOString() ?? "",
      to: range?.to ? addDays(range.to, 1).toISOString() : "",
      role: role === "all" ? undefined : role,
      account: account === "all" ? undefined : account,
    };
    const parsed = exportFilterSchema.safeParse(input);
    const next = parsed.success
      ? {}
      : Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
    setErrors((current) =>
      only ? { ...current, [only]: next[only] ?? "" } : next,
    );
    if (parsed.success && !only)
      setAction({
        title: t("messages.createCsvExport"),
        description: t(
          "messages.accountsRegisteredDuringTheSelectedPeriodFiveColumnsId",
        ),
        execute: (proof) => adminDataApi.create({ ...parsed.data, ...proof }),
      });
  }
  function savePolicy(only?: string) {
    const parsed = retentionPolicySchema.safeParse(policy);
    const next = parsed.success
      ? {}
      : Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
    setErrors((current) =>
      only ? { ...current, [only]: next[only] ?? "" } : next,
    );
    if (parsed.success && !only)
      setAction({
        title: "Modifier la conservation",
        description: `Audit : ${parsed.data.auditDays} jours. Rappels : ${parsed.data.reminderDays} jours. Métadonnées des exports : ${parsed.data.exportDays} jours après expiration. Les aperçus précédents seront invalidés. Aucune purge immédiate.`,
        execute: (proof) => adminDataApi.policy({ ...parsed.data, ...proof }),
      });
  }
  function saveHold(only?: string) {
    const parsed = retentionHoldSchema.safeParse({
      resourceType: holdType,
      resourceId: holdId,
      reason,
    });
    const next = parsed.success
      ? {}
      : Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
    setErrors((current) =>
      only ? { ...current, [only]: next[only] ?? "" } : next,
    );
    if (parsed.success && !only)
      setAction({
        title: "Conserver cet enregistrement",
        description: `Exception pour ${typeLabels[parsed.data.resourceType]} · ${parsed.data.resourceId}. Le motif est réservé à l’administration. Évite les données personnelles dans ce texte.`,
        execute: (proof) => adminDataApi.hold({ ...parsed.data, ...proof }),
      });
  }
  if (me.data && me.data.role !== "admin")
    return (
      <FeedbackState
        icon={LockKeyhole}
        description={t("messages.thisSectionIsRestrictedToAdministrators")}
      />
    );
  return (
    <div className="space-y-6">
      <header>
        <PageTitle icon={Archive}>
          <Localized>{t("navigation.data")}</Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.exportOnlyTheDataYouNeedAndControlRetention",
            )}
          </Localized>
        </p>
      </header>
      <div
        className="flex gap-2"
        role="tablist"
        aria-label={t("messages.dataManagement")}
      >
        {[
          ["exports", t("messages.privateExports")],
          ["retention", t("messages.retention")],
        ].map(([key, text]) => (
          <Button
            key={key}
            role="tab"
            aria-selected={tab === key}
            variant={tab === key ? "default" : "outline"}
            onClick={() => {
              setTab(key);
              setErrors({});
            }}
          >
            {key === "exports" ? (
              <FileDown aria-hidden />
            ) : (
              <Archive aria-hidden />
            )}
            {text}
          </Button>
        ))}
      </div>
      {tab === "exports" ? (
        <>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileDown className="size-5" aria-hidden />
              <Localized>{t("messages.accountExport")}</Localized>
            </h2>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.filterByRegistrationDateInYourLocalTimeZone",
                )}
              </Localized>
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Field
                  id="export-period"
                  label={t("messages.registrationPeriod")}
                  error={errors.from || errors.to}
                >
                  <DateRangePicker
                    id="export-period"
                    value={range}
                    onChange={(value) => {
                      setRange(value);
                      setErrors((current) => ({
                        ...current,
                        from: "",
                        to: "",
                      }));
                    }}
                    invalid={!!(errors.from || errors.to)}
                    placeholder={t("messages.selectPeriod")}
                  />
                </Field>
              </div>
              <Choice
                id="export-role"
                label={t("messages.role")}
                value={role}
                onChange={setRole}
                options={[
                  ["all", t("messages.allRoles")],
                  ["user", t("messages.user")],
                  ["support", "Support"],
                  ["admin", t("messages.administrator")],
                ]}
              />
              <Choice
                id="export-account"
                label={t("messages.account2")}
                value={account}
                onChange={setAccount}
                options={[
                  ["all", t("messages.allAccounts")],
                  ["active", t("messages.active")],
                  ["suspended", t("messages.suspended")],
                ]}
              />
            </div>
            <Button onClick={() => validateExport()}>
              <FileDown aria-hidden />
              <Localized>{t("messages.createAnExport")}</Localized>
            </Button>
          </section>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">
              <Localized>{t("messages.myExports")}</Localized>
            </h2>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.authenticatedDownloadRestrictedToTheCreatorAndTheirSession",
                )}
              </Localized>
            </p>
            {showQuerySkeleton(exports) ? (
              <Skeleton className="h-44" />
            ) : exports.isError ? (
              <FeedbackState
                variant="error"
                description="Impossible de charger les exports"
              >
                <Button
                  variant="outline"
                  onClick={() => void exports.refetch()}
                >
                  <RotateCcw aria-hidden />
                  <Localized>{t("common.retry")}</Localized>
                </Button>
              </FeedbackState>
            ) : !exports.data?.items.length ? (
              <FeedbackState
                icon={FileDown}
                description={t(
                  "messages.noExportsChooseAPeriodToPrepareAMinimized",
                )}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3">
                          <Localized>{t("messages.created")}</Localized>
                        </th>
                        <th className="p-3">
                          <Localized>{t("messages.accounts")}</Localized>
                        </th>
                        <th className="p-3">
                          <Localized>{t("messages.expires")}</Localized>
                        </th>
                        <th className="p-3">
                          <Localized>{t("messages.file")}</Localized>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exports.data.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">
                            {format(
                              new Date(item.createdAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </td>
                          <td className="p-3">{item.rowCount}</td>
                          <td className="p-3">
                            {format(
                              new Date(item.expiresAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!item.available || download.isPending}
                              onClick={() => download.mutate(item.id)}
                            >
                              <Download aria-hidden />
                              {item.available ? t("messages.download") : t("messages.expired")}
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
                  total={exports.data.total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </section>
        </>
      ) : showQuerySkeleton(retention) ? (
        <div className="space-y-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-48" />
        </div>
      ) : retention.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger la conservation"
        >
          <Button onClick={() => void retention.refetch()}>
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : (
        <>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">
              <Localized>{t("messages.retentionPeriods")}</Localized>
            </h2>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.retentionPeriodsMakeDataEligibleForSupervisedPurgingTasks",
                )}
              </Localized>
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["auditDays", "Journal d’audit (jours)", 365, 3650],
                  ["reminderDays", "Rappels (jours)", 30, 3650],
                  ["exportDays", t("messages.exportMetadataDays"), 1, 365],
                ] as const
              ).map(([key, label, min, max]) => (
                <Field key={key} id={key} label={label} error={errors[key]}>
                  <Input
                    id={key}
                    type="number"
                    placeholder={String(min)}
                    min={min}
                    max={max}
                    value={
                      Number.isNaN(policy?.[key]) ? "" : (policy?.[key] ?? "")
                    }
                    aria-invalid={!!errors[key]}
                    aria-describedby={`${key}-error`}
                    onBlur={() => savePolicy(key)}
                    onChange={(event) => {
                      if (policy)
                        setPolicyDraft({
                          ...policy,
                          [key]:
                            event.target.value === ""
                              ? NaN
                              : Number(event.target.value),
                        });
                      setErrors((current) => ({ ...current, [key]: "" }));
                    }}
                  />
                </Field>
              ))}
            </div>
            <Button onClick={() => savePolicy()}>
              <ShieldCheck aria-hidden />
              <Localized>{t("messages.saveRetentionPeriods")}</Localized>
            </Button>
          </section>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">
              <Localized>{t("messages.retentionExceptions")}</Localized>
            </h2>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.protectARecordByIdUntilTheHoldIs",
                )}
              </Localized>
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Choice
                id="hold-type"
                label={t("messages.dataType")}
                value={holdType}
                onChange={(value) => setHoldType(value as typeof holdType)}
                options={Object.entries(typeLabels)}
              />
              <Field
                id="hold-id"
                label="Identifiant de l’enregistrement"
                error={errors.resourceId}
              >
                <Input
                  id="hold-id"
                  placeholder="Ex. 123e4567-e89b-12d3-a456-426614174000"
                  value={holdId}
                  aria-invalid={!!errors.resourceId}
                  aria-describedby="hold-id-error"
                  onBlur={() => saveHold("resourceId")}
                  onChange={(event) => {
                    setHoldId(event.target.value);
                    setErrors((current) => ({ ...current, resourceId: "" }));
                  }}
                />
              </Field>
            </div>
            <Field
              id="hold-reason"
              label="Motif de conservation"
              error={errors.reason}
            >
              <Input
                id="hold-reason"
                placeholder="Ex. Investigation de livraison en cours"
                maxLength={240}
                value={reason}
                aria-invalid={!!errors.reason}
                aria-describedby="hold-reason-error"
                onBlur={() => saveHold("reason")}
                onChange={(event) => {
                  setReason(event.target.value);
                  setErrors((current) => ({ ...current, reason: "" }));
                }}
              />
            </Field>
            <Button variant="outline" onClick={() => saveHold()}>
              <LockKeyhole aria-hidden />
              <Localized>{t("messages.addAnException")}</Localized>
            </Button>
            {!retention.data?.holds.length ? (
              <FeedbackState
                icon={LockKeyhole}
                description={t("messages.noActiveHolds")}
              />
            ) : (
              <ul className="space-y-2">
                {retention.data.holds.map((hold) => (
                  <li
                    key={hold.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {typeLabels[hold.resourceType]}
                      </p>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {hold.resourceId}
                      </p>
                      <p className="text-sm">{hold.reason}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAction({
                          title: t("messages.releaseHold"),
                          description: `L’enregistrement ${hold.resourceId} redeviendra éligible selon sa durée de conservation. Cette action ne lance pas de purge.`,
                          execute: (proof) =>
                            adminDataApi.release(hold.id, proof),
                        })
                      }
                    >
                      <LockKeyholeOpen aria-hidden />
                      <Localized>{t("messages.releaseHold")}</Localized>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Trash2 className="size-5" aria-hidden />
              <Localized>{t("messages.supervisedPurge")}</Localized>
            </h2>
            <p className="text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.calculateAPreviewAndConfirmTheBatchMaximum1",
                )}
              </Localized>
            </p>
            <Button
              variant="outline"
              disabled={preview.isPending}
              onClick={() => preview.mutate()}
            >
              <RotateCcw aria-hidden />
              {preview.isPending ? "Calcul…" : t("messages.calculatePreview")}
            </Button>
            {plan && (
              <div className="space-y-3 rounded-lg border bg-background p-4">
                <p className="text-sm">
                  <Localized>{t("messages.batch")}</Localized>
                  {plan.counts.audit}{" "}
                  <Localized>{t("messages.auditEvents")}</Localized>{" "}
                  {plan.counts.reminders}{" "}
                  <Localized>{t("messages.reminders")}</Localized>
                  {plan.counts.exports} <Localized>{"messages.exports"}</Localized>
                </p>
                <p className="text-xs text-muted-foreground">
                  <Localized>{t("messages.validUntil")}</Localized>
                  {format(new Date(plan.expiresAt), "HH:mm:ss")}
                  <Localized>
                    {t(
                      "messages.newRecordsWillNotBeAddedToThisBatch",
                    )}
                  </Localized>
                </p>
                <Button
                  variant="destructive"
                  disabled={!Object.values(plan.counts).some(Boolean)}
                  onClick={() =>
                    setAction({
                      title: "Purger ce lot",
                      description: `Suppression définitive de jusqu’à ${plan.counts.audit} événements d’audit, ${plan.counts.reminders} rappels et ${plan.counts.exports} fiches d’export. Le résultat et l’auteur restent enregistrés dans le journal et le suivi des purges.`,
                      destructive: true,
                      execute: (proof) =>
                        adminDataApi.purge({
                          ...proof,
                          planId: plan.id,
                          confirmation: "PURGER",
                        }),
                    })
                  }
                >
                  <Trash2 aria-hidden />
                  <Localized>{t("messages.confirmPurge")}</Localized>
                </Button>
              </div>
            )}
          </section>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">
              <Localized>{t("messages.recentPurges")}</Localized>
            </h2>
            {!retention.data?.runs.length ? (
              <FeedbackState
                icon={Archive}
                description={t("messages.noPurgesPerformed")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">
                        <Localized>
                          <Localized>{"messages.date2"}</Localized>
                        </Localized>
                      </th>
                      <th className="p-3">
                        <Localized>{"messages.audit"}</Localized>
                      </th>
                      <th className="p-3">
                        <Localized>{t("messages.reminders2")}</Localized>
                      </th>
                      <th className="p-3">
                        <Localized>{"messages.exports2"}</Localized>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {retention.data.runs.map((run) => (
                      <tr key={run.id} className="border-b">
                        <td className="p-3">
                          {format(new Date(run.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="p-3">{run.auditDeleted}</td>
                        <td className="p-3">{run.remindersDeleted}</td>
                        <td className="p-3">{run.exportsDeleted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      {action && (
        <AdminDataProof
          action={action}
          onClose={() => setAction(undefined)}
          onSuccess={async () => {
            setPage(1);
            setPlan(undefined);
            setPolicyDraft(undefined);
            await cache.invalidateQueries({ queryKey: ["admin"] });
          }}
        />
      )}
    </div>
  );
}
