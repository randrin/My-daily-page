"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { ShieldCheck, Copy, Download, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  mfaApi,
  mfaPasswordSchema,
  mfaConfirmSchema,
  mfaDisableSchema,
  type MfaSetup,
} from "@/api/mfa";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
export function MfaSettings() {
  const status = useQuery({
    queryKey: ["mfa-status"],
    queryFn: mfaApi.status,
    retry: false,
  });
  const [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [setup, setSetup] = useState<MfaSetup>(),
    [saved, setSaved] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({});
  const begin = useMutation({ mutationFn: mfaApi.setup }),
    confirm = useMutation({ mutationFn: mfaApi.confirm }),
    disable = useMutation({ mutationFn: mfaApi.disable }),
    cancel = useMutation({ mutationFn: mfaApi.cancel });
  const pending =
    begin.isPending ||
    confirm.isPending ||
    disable.isPending ||
    cancel.isPending;
  const enabled = status.data?.enabled;
  async function submit() {
    const schema = enabled
      ? mfaDisableSchema
      : setup
        ? mfaConfirmSchema
        : mfaPasswordSchema;
    const input = { password, code };
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }
    setErrors({});
    try {
      if (enabled) {
        await disable.mutateAsync({ password, code: code.trim() });
        toast.success("MFA désactivée. Reconnecte-toi.");
        await signOut({ callbackUrl: "/auth/signin" });
      } else if (setup) {
        if (!saved) {
          setErrors({
            saved: "Conserve tes codes de récupération avant de continuer",
          });
          return;
        }
        await confirm.mutateAsync({ code: code.trim() });
        toast.success(
          "MFA activée. Reconnecte-toi avec le prochain code de ton application.",
        );
        await signOut({ callbackUrl: "/auth/signin" });
      } else {
        setSetup(await begin.mutateAsync({ password }));
        setPassword("");
        setCode("");
        setSaved(false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible de modifier la MFA"));
    }
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copié");
    } catch {
      toast.error("Copie impossible. Sélectionne le texte manuellement.");
    }
  }
  function download() {
    if (!setup) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          "My Daily Page — Codes de récupération à usage unique\n\n" +
            setup.recoveryCodes.join("\n"),
        ],
        { type: "text/plain" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-daily-page-codes-recuperation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section
      className="rounded-xl border bg-card p-5 space-y-4"
      aria-labelledby="mfa-title"
    >
      <h2 id="mfa-title" className="flex items-center gap-2 font-semibold">
        <ShieldCheck aria-hidden />
        Sécurité et MFA
      </h2>
      <p className="text-sm text-muted-foreground">
        Protège ton compte avec un code à 6 chiffres fourni par Google
        Authenticator, Microsoft Authenticator ou une autre application TOTP. À
        la connexion, ce code sera demandé après ton email et ton mot de passe.
      </p>
      {showQuerySkeleton(status) ? (
        <Skeleton className="h-32" />
      ) : status.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger la sécurité du compte."
        >
          <Button onClick={() => void status.refetch()} variant="outline">
            Réessayer
          </Button>
        </FeedbackState>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="size-4" aria-hidden />
            {enabled
              ? `MFA activée · ${status.data?.recoveryRemaining} codes de récupération disponibles`
              : "MFA désactivée"}
          </p>
          {!enabled && !setup && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-medium">
                Comment configurer Authenticator ?
              </h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Installe Google Authenticator ou Microsoft Authenticator sur
                  ton téléphone.
                </li>
                <li>
                  Saisis ton mot de passe actuel ci-dessous, puis clique sur{" "}
                  <strong className="text-foreground">Configurer la MFA</strong>
                  .
                </li>
                <li>
                  Dans l’application, ajoute un compte et choisis de scanner un
                  QR code. Scanne celui qui apparaîtra ici : un compte{" "}
                  <strong className="text-foreground">My Daily Page</strong>{" "}
                  sera ajouté.
                </li>
                <li>
                  Conserve les codes de récupération proposés, puis saisis le
                  code à 6 chiffres affiché dans l’application pour confirmer
                  l’activation.
                </li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Le code change toutes les 30 secondes. Aucun SMS n’est
                nécessaire. Si tu configures sur le même téléphone, utilise la
                clé manuelle proposée sous le QR code.
              </p>
            </div>
          )}
          {!setup && (
            <div className="space-y-2">
              <label
                htmlFor="mfa-password"
                className={errors.password ? "text-destructive" : ""}
              >
                Mot de passe actuel
              </label>
              <InputPassword
                id="mfa-password"
                autoComplete="current-password"
                placeholder="Ton mot de passe actuel"
                value={password}
                disabled={pending}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: "" }));
                }}
                onBlur={() => {
                  if (
                    password &&
                    !mfaPasswordSchema.safeParse({ password }).success
                  )
                    setErrors((current) => ({
                      ...current,
                      password: "Au moins 8 caractères",
                    }));
                }}
                aria-invalid={!!errors.password}
                aria-describedby="mfa-password-error"
              />
              {errors.password && (
                <p
                  id="mfa-password-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </p>
              )}
            </div>
          )}
          {setup && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium">
                1. Ajoute My Daily Page dans Authenticator
              </h3>
              <div className="grid items-start gap-4 sm:grid-cols-[auto_1fr]">
                <div className="w-fit max-w-full rounded-xl border bg-white p-2">
                  <QRCodeSVG
                    value={setup.uri}
                    size={220}
                    level="M"
                    marginSize={4}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    role="img"
                    aria-label="QR code de configuration MFA à scanner dans ton application d’authentification"
                    className="h-auto max-w-full"
                  />
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Ouvre ton application Authenticator, ajoute un compte puis
                    choisis le scan d’un QR code. Autorise la caméra si
                    l’application le demande et vise ce QR code.
                  </p>
                  <p>
                    Le compte{" "}
                    <strong className="text-foreground">My Daily Page</strong>{" "}
                    apparaît avec un code à 6 chiffres qui se renouvelle toutes
                    les 30 secondes.
                  </p>
                  <p>
                    Le QR code est généré directement dans ton navigateur, sans
                    service externe. Garde-le privé, comme la clé manuelle.
                  </p>
                  <p className="font-medium text-foreground">
                    Cette configuration expire après 10 minutes. Si elle expire,
                    annule et recommence.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Impossible de scanner, ou configuration sur le même téléphone ?
                Ajoute un compte manuellement avec la clé ci-dessous : nom My
                Daily Page, type basé sur le temps (TOTP), 6 chiffres, période
                30 secondes et SHA1 si ces options sont demandées.
              </p>
              <label htmlFor="mfa-secret" className="text-sm font-medium">
                Clé de configuration
              </label>
              <div className="flex gap-2">
                <Input
                  id="mfa-secret"
                  readOnly
                  value={setup.secret}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => void copy(setup.secret)}
                  aria-label="Copier la clé de configuration"
                >
                  <Copy />
                </Button>
              </div>
              <h3 className="font-medium">
                2. Conserve tes codes de récupération
              </h3>
              <p className="text-sm text-muted-foreground">
                Conserve ces codes dans un endroit sûr. Ils ne seront plus
                affichés après activation. Chacun remplace le second facteur une
                seule fois si tu perds ton appareil.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {setup.recoveryCodes.map((value) => (
                  <code
                    key={value}
                    className="break-all rounded bg-background p-2 text-xs"
                  >
                    {value}
                  </code>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => void copy(setup.recoveryCodes.join("\n"))}
                >
                  <Copy />
                  Copier les codes
                </Button>
                <Button variant="outline" onClick={download}>
                  <Download />
                  Télécharger les codes
                </Button>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saved}
                  disabled={pending}
                  onChange={(event) => {
                    setSaved(event.target.checked);
                    setErrors((current) => ({ ...current, saved: "" }));
                  }}
                />
                J’ai conservé mes codes de récupération
              </label>
              {errors.saved && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.saved}
                </p>
              )}
            </div>
          )}
          {(setup || enabled) && (
            <div className="space-y-2">
              <label
                htmlFor="mfa-confirm-code"
                className={errors.code ? "text-destructive" : ""}
              >
                {enabled
                  ? "Code d’authentification ou de récupération"
                  : "3. Saisis le code à 6 chiffres de l’application"}
              </label>
              <Input
                id="mfa-confirm-code"
                value={code}
                maxLength={64}
                autoComplete="one-time-code"
                placeholder={
                  enabled
                    ? "Code à 6 chiffres ou code de récupération"
                    : "Ex. 123456"
                }
                disabled={pending}
                onChange={(event) => {
                  setCode(event.target.value);
                  setErrors((current) => ({ ...current, code: "" }));
                }}
                aria-invalid={!!errors.code}
                aria-describedby="mfa-confirm-error"
              />
              {errors.code && (
                <p
                  id="mfa-confirm-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.code}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={enabled ? "destructive" : "default"}
              disabled={pending || (!!setup && !saved)}
              onClick={() => void submit()}
            >
              {pending
                ? "Vérification…"
                : enabled
                  ? "Désactiver la MFA"
                  : setup
                    ? "Confirmer l’activation"
                    : "Configurer la MFA"}
            </Button>
            {setup && (
              <Button
                variant="outline"
                disabled={pending}
                onClick={async () => {
                  try {
                    await cancel.mutateAsync();
                  } catch (error) {
                    toast.error(
                      getApiErrorMessage(
                        error,
                        "Impossible d’annuler la configuration",
                      ),
                    );
                    return;
                  }
                  setSetup(undefined);
                  setCode("");
                  setSaved(false);
                  setErrors({});
                }}
              >
                Annuler la configuration
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            L’activation et la désactivation déconnectent tous tes appareils.
            Après activation, reconnecte-toi avec le prochain code affiché dans
            Authenticator : le code de confirmation ne peut pas être réutilisé.
            Si un code est refusé, vérifie que la date et l’heure de ton
            téléphone sont réglées automatiquement.
          </p>
        </>
      )}
    </section>
  );
}
