"use client";
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
  accepted: "Accepté",
  declined: "Refusé",
  revoked: "Révoqué",
  expired: "Expiré",
};
export function CompanionScreen() {
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
      toast.success("Préférence enregistrée");
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
        "Invitation créée. Partage toi-même le lien avec la personne choisie.",
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
      toast.success("Réponse enregistrée");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Réponse impossible")),
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
      toast.success("Binôme mis à jour");
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
        <PageTitle icon={Users}>Habitudes et binôme</PageTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Des suggestions personnelles et un soutien choisi. Tu gardes le
          contrôle de tes tâches et des données partagées.
        </p>
      </header>
      <section className="space-y-4 rounded-xl border bg-gradient-to-br from-amber-500/10 via-background to-background p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Clock className="size-5" aria-hidden />
          Mes créneaux de réalisation
        </h2>
        <p className="text-sm text-muted-foreground">
          Après activation, l’application observe uniquement l’heure de première
          clôture de tes tâches, pendant 90 jours, dans ton fuseau. Ce sont des
          habitudes observées, pas une mesure de ton énergie. Rien n’est déduit
          de tes anciennes tâches ni déplacé automatiquement.
        </p>
        {showQuerySkeleton(energy) ? (
          <Skeleton className="h-32" />
        ) : energy.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger les créneaux"
          >
            <Button onClick={() => void energy.refetch()}>Réessayer</Button>
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
                ? "Observation activée"
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
                    Sur {energy.data.total} clôtures récentes ·{" "}
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
                          {slot.count} clôture(s) observée(s)
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ces heures sont également proposées à la création d’une
                    tâche. Les appliquer reste ton choix.
                  </p>
                </>
              ))}
          </>
        )}
      </section>
      {!!token && (
        <section className="space-y-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-5">
          <h2 className="font-semibold">Invitation reçue</h2>
          {showQuerySkeleton(invitation) ? (
            <Skeleton className="h-28" />
          ) : invitation.isError ? (
            <FeedbackState
              variant="error"
              description="Cette invitation a expiré, a été révoquée ou concerne un autre compte."
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
                Fermer
              </Button>
            </FeedbackState>
          ) : (
            <>
              <p className="text-sm">
                {invitation.data?.name} souhaite te choisir comme binôme. En
                acceptant, tu autorises des alertes email contenant son prénom
                et le nombre de tâches en retard depuis plus de 24 heures,
                lorsqu’il y en a au moins deux. Un email maximum par jour, selon
                ses jours locaux. Aucun contenu de tâche n’est partagé.
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={acceptConsent}
                  onChange={(e) => setAcceptConsent(e.target.checked)}
                  disabled={respond.isPending}
                />
                J’accepte ce partage limité et les alertes de ce binôme.
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={!acceptConsent || respond.isPending}
                  onClick={() => respond.mutate(true)}
                >
                  Accepter
                </Button>
                <Button
                  variant="outline"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate(false)}
                >
                  Refuser
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tu peux suspendre ou révoquer à tout moment. L’envoi requiert
                aussi tes notifications et ton canal Email activés.
              </p>
            </>
          )}
        </section>
      )}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Users className="size-5" aria-hidden />
          Choisir mon binôme
        </h2>
        <p className="text-sm text-muted-foreground">
          Choisis une personne disposant déjà d’un compte My Daily Page. Tu
          partageras toi-même le lien d’invitation, valable 7 jours. Aucun
          message ne part à la création de l’invitation. Une relation sortante
          active par personne ; cinq binômes suivis maximum.
        </p>
        <div className="space-y-2">
          <label
            htmlFor="companion-email"
            className={`text-sm font-medium ${errors.email ? "text-destructive" : ""}`}
          >
            Email du compte de ton binôme
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
          J’accepte de partager mon prénom et le nombre de tâches en retard
          depuis plus de 24 heures avec ce binôme, après son accord explicite.
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
          Créer l’invitation
        </Button>
        {link && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <label htmlFor="companion-link" className="text-sm font-medium">
              Lien privé à partager avec cette personne
            </label>
            <div className="flex gap-2">
              <Input id="companion-link" readOnly value={link} />
              <Button
                variant="outline"
                aria-label="Copier le lien d’invitation"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    toast.success("Lien copié");
                  } catch {
                    toast.error("Sélectionne et copie le lien manuellement");
                  }
                }}
              >
                <Copy aria-hidden />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Il est affiché une seule fois. Si tu le perds, révoque
              l’invitation et crée-en une nouvelle.
            </p>
          </div>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Users className="size-5 shrink-0" aria-hidden />
          Mes relations
        </h2>
        <p className="text-sm text-muted-foreground">
          Les alertes nécessitent les notifications et le canal Email activés
          chez les deux personnes, et respectent les pauses et horaires
          silencieux de chacun.{" "}
          <Link href="/dashboard/preferences" className="underline">
            Gérer mes notifications
          </Link>
          . Un message déjà transmis au fournisseur ne peut pas être rappelé.
        </p>
        {showQuerySkeleton(pairs) ? (
          <Skeleton className="h-36" />
        ) : pairs.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger les binômes"
          >
            <Button onClick={() => void pairs.refetch()}>Réessayer</Button>
          </FeedbackState>
        ) : !pairs.data?.length ? (
          <FeedbackState
            icon={Users}
            description="Aucun binôme pour le moment. Une invitation acceptée permet de commencer."
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
                      : "Je soutiens ce binôme"}{" "}
                    · {statuses[pair.status]}
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
                        ? "Ma participation est activée"
                        : "Ma participation est désactivée"}
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
                      Révoquer
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
          Dernières alertes de binôme
        </h2>
        <p className="text-sm text-muted-foreground">
          Accepté signifie accepté par le fournisseur, pas une garantie de
          réception. Envoi incertain : aucun renvoi automatique. Historique
          conservé 90 jours, vingt derniers résultats affichés.
        </p>
        {showQuerySkeleton(deliveries) ? (
          <Skeleton className="h-28" />
        ) : deliveries.isError ? (
          <FeedbackState variant="error" description="Historique indisponible">
            <Button onClick={() => void deliveries.refetch()}>Réessayer</Button>
          </FeedbackState>
        ) : !deliveries.data?.length ? (
          <FeedbackState
            icon={Users}
            description="Aucune alerte de binôme pour le moment"
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
                      pending: "Planifié",
                      sending: "En cours",
                      accepted: "Accepté par le fournisseur",
                      failed: "Échec",
                      uncertain: "Envoi incertain",
                      cancelled: "Annulé",
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
                ? "Désactiver les observations ?"
                : "Révoquer ce binôme ?"}
            </DialogTitle>
            <DialogDescription>
              {disableEnergy
                ? "Les observations de clôture seront supprimées et les nouvelles clôtures ne seront plus collectées. Tes tâches restent intactes."
                : "La relation sera fermée et les futures alertes arrêtées. Il faudra une nouvelle invitation et un nouvel accord pour recommencer."}
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
              Annuler
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
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
