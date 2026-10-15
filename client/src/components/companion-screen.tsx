"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Clock,
  Users,
  CheckCircle2,
  BellOff,
  BellRing,
  Copy,
  Trash2,
  Undo2,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCompanionDeliveries,
  inviteSchema,
  personalizationApi,
} from "@/api/personalization";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { useMe } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
export const companionInviteKey = "my-daily-page:companion-invite";
const statuses: Record<string, string> = {
  pending: "Invitation en attente",
  accepted: "messages.accepted",
  declined: "messages.declined",
  revoked: "messages.revoked",
  expired: "messages.expired",
};
export function CompanionScreen() {
  const t = useTranslator();
  const cache = useQueryClient(),
    me = useMe();
  const energy = useQuery({
    queryKey: ["personalization", "energy"],
    queryFn: personalizationApi.energy,
    refetchInterval: 60000,
    retry: false,
  });
  const pairs = useQuery({
    queryKey: ["personalization", "companions"],
    queryFn: personalizationApi.pairs,
    retry: false,
  });
  const deliveries = useQuery({
    queryKey: ["personalization", "deliveries"],
    queryFn: getCompanionDeliveries,
    retry: false,
    refetchInterval: 60000,
  });
  const [email, setEmail] = useState(""),
    [consent, setConsent] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [link, setLink] = useState(""),
    [token, setToken] = useState(""),
    [acceptConsent, setAcceptConsent] = useState(false),
    [revokeId, setRevokeId] = useState<string>(),
    [disableEnergy, setDisableEnergy] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = sessionStorage.getItem(companionInviteKey);
        if (stored && /^[a-f0-9]{64}$/.test(stored)) setToken(stored);
      } catch {
        /* storage unavailable */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const invitation = useQuery({
    queryKey: ["personalization", "invitation", token],
    queryFn: () => personalizationApi.invitation(token),
    enabled: !!token,
    retry: false,
    gcTime: 0,
  });
  const refresh = () =>
    cache.invalidateQueries({ queryKey: ["personalization"] });
  const energyMutation = useMutation({
    mutationFn: personalizationApi.setEnergy,
    onSuccess: async () => {
      setDisableEnergy(false);
      await refresh();
      toast.success(t("messages.preferenceSaved"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Modification impossible")),
  });
  const invite = useMutation({
    mutationFn: personalizationApi.invite,
    onSuccess: async (result) => {
      setLink(`${window.location.origin}/companion-invite#${result.token}`);
      setConsent(false);
      await refresh();
      toast.success(
        t(
          "messages.invitationCreatedShareTheLinkYourselfWithTheChosen",
        ),
      );
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Invitation impossible")),
  });
  const respond = useMutation({
    mutationFn: (accepted: boolean) =>
      personalizationApi.respond(token, accepted),
    onSuccess: async () => {
      try {
        sessionStorage.removeItem(companionInviteKey);
      } catch {
        /* storage unavailable */
      }
      setToken("");
      setAcceptConsent(false);
      await refresh();
      toast.success(t("messages.responseSaved"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, t("messages.unableToRespond"))),
  });
  const pairAction = useMutation({
    mutationFn: (input: { id: string; enabled?: boolean }) =>
      input.enabled === undefined
        ? personalizationApi.revoke(input.id)
        : personalizationApi.togglePair(input.id, input.enabled),
    onSuccess: async () => {
      setRevokeId(undefined);
      setLink("");
      await refresh();
      toast.success(t("messages.partnershipUpdated"));
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Modification impossible")),
  });
  function validateInvite(field?: string) {
    const parsed = inviteSchema.safeParse({ email, consent });
    const next = parsed.success
      ? {}
      : Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
        );
    setErrors((current) =>
      field ? { ...current, [field]: next[field] ?? "" } : next,
    );
    return parsed;
  }
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PageTitle icon={Users}>
          <Localized>{t("navigation.companion")}</Localized>
        </PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.personalSuggestionsAndSupportYouChooseYouControlYour",
            )}
          </Localized>
        </p>
      </header>
      <section className="space-y-4 rounded-xl border bg-gradient-to-br from-amber-500/10 via-background to-background p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Clock className="size-5" aria-hidden />
          <Localized>{t("messages.myCompletionTimes")}</Localized>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.onceEnabledTheAppObservesOnlyYourFirstTask",
            )}
          </Localized>
        </p>
        {showQuerySkeleton(energy) ? (
          <Skeleton className="h-32" />
        ) : energy.isError ? (
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadTimeSlots")}
          >
            <Button onClick={() => void energy.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : (
          <>
            <Button
              role="switch"
              aria-checked={energy.data?.enabled}
              disabled={energyMutation.isPending}
              variant={energy.data?.enabled ? "default" : "outline"}
              onClick={() =>
                energy.data?.enabled
                  ? setDisableEnergy(true)
                  : energyMutation.mutate(true)
              }
            >
              {energy.data?.enabled ? (
                <CheckCircle2 aria-hidden />
              ) : (
                <BellOff aria-hidden />
              )}
              {energy.data?.enabled
                ? t("messages.observationEnabled")
                : "Activer l’observation"}
            </Button>
            {energy.data?.enabled &&
              (!energy.data.suggestions.length ? (
                <FeedbackState
                  icon={Clock}
                  description={`${energy.data.total} tâche(s) clôturée(s) sur ${energy.data.days} jour(s). Les suggestions apparaissent après au moins 5 clôtures sur 3 jours distincts.`}
                />
              ) : (
                <>
                  <p className="text-sm">
                    <Localized>{t("messages.basedOn")}</Localized>
                    {energy.data.total}{" "}
                    <Localized>{t("messages.recentCompletions")}</Localized>{" "}
                    {me.data?.timezone ?? "fuseau du profil"}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {energy.data.suggestions.map((slot) => (
                      <div
                        key={slot.hour}
                        className="rounded-lg border bg-card p-4"
                      >
                        <p className="font-semibold">
                          {String(slot.hour).padStart(2, "0")}:00 –{" "}
                          {String(slot.hour + 1).padStart(2, "0")}:00
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {slot.count}{" "}
                          <Localized>{t("messages.observedCompletionS")}</Localized>
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Localized>
                      {t(
                        "messages.theseTimesAreAlsoSuggestedWhenCreatingTasksUsing",
                      )}
                    </Localized>
                  </p>
                </>
              ))}
          </>
        )}
      </section>
      {!!token && (
        <section className="space-y-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-5">
          <h2 className="font-semibold">
            <Localized>{t("messages.receivedInvitation")}</Localized>
          </h2>
          {showQuerySkeleton(invitation) ? (
            <Skeleton className="h-28" />
          ) : invitation.isError ? (
            <FeedbackState
              variant="error"
              description={t(
                "messages.thisInvitationHasExpiredWasRevokedOrBelongsTo",
              )}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setToken("");
                  try {
                    sessionStorage.removeItem(companionInviteKey);
                  } catch {
                    /* storage unavailable */
                  }
                }}
              >
                <Localized>{t("common.close")}</Localized>
              </Button>
            </FeedbackState>
          ) : (
            <>
              <p className="text-sm">
                {invitation.data?.name}{" "}
                <Localized>
                  {t(
                    "messages.wouldLikeToChooseYouAsAPartnerAccepting",
                  )}
                </Localized>
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={acceptConsent}
                  onChange={(e) => setAcceptConsent(e.target.checked)}
                  disabled={respond.isPending}
                />
                <Localized>
                  {t(
                    "messages.iAgreeToThisLimitedSharingAndThisPartner",
                  )}
                </Localized>
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={!acceptConsent || respond.isPending}
                  onClick={() => respond.mutate(true)}
                >
                  <Localized>{t("messages.accept")}</Localized>
                </Button>
                <Button
                  variant="outline"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate(false)}
                >
                  <Localized>{t("messages.decline")}</Localized>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                <Localized>
                  {t(
                    "messages.youCanPauseOrRevokeAtAnyTimeYour",
                  )}
                </Localized>
              </p>
            </>
          )}
        </section>
      )}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Users className="size-5" aria-hidden />
          <Localized>{t("messages.chooseMyPartner")}</Localized>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.chooseSomeoneWithAMyDailyPageAccountShare",
            )}
          </Localized>
        </p>
        <div className="space-y-2">
          <label
            htmlFor="companion-email"
            className={`text-sm font-medium ${errors.email ? "text-destructive" : ""}`}
          >
            <Localized>{t("messages.partnerSAccountEmail")}</Localized>
          </label>
          <Input
            id="companion-email"
            type="email"
            autoComplete="off"
            placeholder="Ex. personne@exemple.fr"
            value={email}
            disabled={invite.isPending}
            aria-invalid={!!errors.email}
            aria-describedby="companion-email-error"
            onBlur={() => validateInvite("email")}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((current) => ({ ...current, email: "" }));
            }}
          />
          {errors.email && (
            <p
              id="companion-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.email}
            </p>
          )}
        </div>
        <label
          className={`flex items-start gap-2 text-sm ${errors.consent ? "text-destructive" : ""}`}
        >
          <input
            type="checkbox"
            checked={consent}
            disabled={invite.isPending}
            aria-describedby="companion-consent-error"
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((current) => ({ ...current, consent: "" }));
            }}
          />
          <Localized>
            {t(
              "messages.iAgreeToShareMyFirstNameAndThe",
            )}
          </Localized>
        </label>
        {errors.consent && (
          <p
            id="companion-consent-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.consent}
          </p>
        )}
        <Button
          disabled={invite.isPending}
          onClick={() => {
            const parsed = validateInvite();
            if (parsed.success) invite.mutate(parsed.data);
          }}
        >
          <Users aria-hidden />
          <Localized>{t("messages.createInvitation")}</Localized>
        </Button>
        {link && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <label htmlFor="companion-link" className="text-sm font-medium">
              <Localized>
                {t("messages.privateLinkToShareWithThisPerson")}
              </Localized>
            </label>
            <div className="flex gap-2">
              <Input id="companion-link" readOnly value={link} />
              <Button
                variant="outline"
                aria-label="Copier le lien d’invitation"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    toast.success(t("messages.linkCopied"));
                  } catch {
                    toast.error(t("messages.selectAndCopyTheLinkManually"));
                  }
                }}
              >
                <Copy aria-hidden />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <Localized>
                {t(
                  "messages.shownOnlyOnceIfLostRevokeTheInvitationAnd",
                )}
              </Localized>
            </p>
          </div>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Users className="size-5 shrink-0" aria-hidden />
          <Localized>{t("messages.myRelationships")}</Localized>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.bothPeopleMustEnableNotificationsAndEmailAlertsRespect",
            )}
          </Localized>{" "}
          <Link href="/dashboard/preferences" className="underline">
            <Localized>{t("messages.manageMyNotifications")}</Localized>
          </Link>
          <Localized>
            {t(
              "messages.aMessageAlreadySubmittedToTheProviderCannotBe",
            )}
          </Localized>
        </p>
        {showQuerySkeleton(pairs) ? (
          <Skeleton className="h-36" />
        ) : pairs.isError ? (
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadPartners")}
          >
            <Button onClick={() => void pairs.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : !pairs.data?.length ? (
          <FeedbackState
            icon={Users}
            description={t(
              "messages.noPartnersYetAnAcceptedInvitationLetsYouGet",
            )}
          />
        ) : (
          <ul className="space-y-3">
            {pairs.data.map((pair) => (
              <li
                key={pair.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{pair.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pair.direction === "outgoing"
                      ? "Je partage mes retards"
                      : t("messages.iSupportThisPartner")}{" "}
                    · <Localized>{statuses[pair.status]}</Localized>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pair.status === "accepted" && (
                    <Button
                      variant={pair.enabled ? "default" : "outline"}
                      size="sm"
                      disabled={pairAction.isPending}
                      onClick={() =>
                        pairAction.mutate({
                          id: pair.id,
                          enabled: !pair.enabled,
                        })
                      }
                    >
                      {pair.enabled ? (
                        <CheckCircle2 aria-hidden />
                      ) : (
                        <BellOff aria-hidden />
                      )}
                      {pair.enabled
                        ? t("messages.myParticipationIsEnabled")
                        : t("messages.myParticipationIsDisabled")}
                    </Button>
                  )}
                  {["pending", "accepted"].includes(pair.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pairAction.isPending}
                      onClick={() => setRevokeId(pair.id)}
                    >
                      <Trash2 aria-hidden />
                      <Localized>{t("messages.revoke")}</Localized>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <BellRing className="size-5 shrink-0" aria-hidden />
          <Localized>{t("messages.recentPartnerAlerts")}</Localized>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.acceptedMeansAcceptedByTheProviderNotGuaranteedDelivery",
            )}
          </Localized>
        </p>
        {showQuerySkeleton(deliveries) ? (
          <Skeleton className="h-28" />
        ) : deliveries.isError ? (
          <FeedbackState variant="error" description="Historique indisponible">
            <Button onClick={() => void deliveries.refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : !deliveries.data?.length ? (
          <FeedbackState
            icon={Users}
            description={t("messages.noPartnerAlertsYet")}
          />
        ) : (
          <ul className="space-y-2">
            {deliveries.data.map((delivery) => (
              <li
                key={delivery.id}
                className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <span>
                  {delivery.name} · {delivery.day}
                </span>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  {(
                    {
                      pending: t("messages.scheduled"),
                      sending: t("tasks.status.inProgress"),
                      accepted: t("messages.acceptedByProvider"),
                      failed: t("messages.failed2"),
                      uncertain: "Envoi incertain",
                      cancelled: t("messages.cancelled"),
                    } as Record<string, string>
                  )[delivery.status] ?? delivery.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Dialog
        open={disableEnergy || !!revokeId}
        onOpenChange={(open) => {
          if (!open && !pairAction.isPending && !energyMutation.isPending) {
            setDisableEnergy(false);
            setRevokeId(undefined);
          }
        }}
      >
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {disableEnergy
                ? t("messages.disableObservations")
                : t("messages.revokeThisPartnership")}
            </DialogTitle>
            <DialogDescription>
              {disableEnergy
                ? t(
                    "messages.completionObservationsWillBeDeletedAndNewCompletionsWill",
                  )
                : t(
                    "messages.theRelationshipWillCloseAndFutureAlertsStopA",
                  )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pairAction.isPending || energyMutation.isPending}
              onClick={() => {
                setDisableEnergy(false);
                setRevokeId(undefined);
              }}
            >
              <Undo2 className="size-4" aria-hidden />
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              variant="destructive"
              disabled={pairAction.isPending || energyMutation.isPending}
              onClick={() =>
                disableEnergy
                  ? energyMutation.mutate(false)
                  : revokeId && pairAction.mutate({ id: revokeId })
              }
            >
              {disableEnergy ? (
                <BellOff className="size-4" aria-hidden />
              ) : (
                <UserRoundX className="size-4" aria-hidden />
              )}
              <Localized>{t("common.confirm")}</Localized>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
