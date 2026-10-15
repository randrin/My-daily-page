"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
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
  const t = useTranslator();
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
        toast.success(t("messages.mfaDisabledSignInAgain"));
        await signOut({ callbackUrl: "/auth/signin" });
      } else if (setup) {
        if (!saved) {
          setErrors({
            saved: t("messages.saveYourRecoveryCodesBeforeContinuing"),
          });
          return;
        }
        await confirm.mutateAsync({ code: code.trim() });
        toast.success(
          t(
            "messages.mfaEnabledSignInAgainUsingYourAppS",
          ),
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
      toast.success(t("messages.copied"));
    } catch {
      toast.error(t("messages.copyFailedSelectTheTextManually"));
    }
  }
  function download() {
    if (!setup) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          t("messages.myDailyPageSingleUseRecoveryCodes") +
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
        <Localized>{t("messages.securityAndMfa")}</Localized>
      </h2>
      <p className="text-sm text-muted-foreground">
        <Localized>
          {t(
            "messages.protectYourAccountWithASixDigitCodeFrom",
          )}
        </Localized>
      </p>
      {showQuerySkeleton(status) ? (
        <Skeleton className="h-32" />
      ) : status.isError ? (
        <FeedbackState
          variant="error"
          description={t("messages.unableToLoadAccountSecurity")}
        >
          <Button onClick={() => void status.refetch()} variant="outline">
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="size-4" aria-hidden />
            {enabled
              ? `MFA activée · ${status.data?.recoveryRemaining} codes de récupération disponibles`
              : t("messages.mfaDisabled")}
          </p>
          {!enabled && !setup && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <h3 className="font-medium">
                <Localized>{t("messages.howDoISetUpAuthenticator")}</Localized>
              </h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  <Localized>
                    {t(
                      "messages.installGoogleAuthenticatorOrMicrosoftAuthenticatorOnYourPhone",
                    )}
                  </Localized>
                </li>
                <li>
                  <Localized>
                    {t(
                      "messages.enterYourCurrentPasswordBelowThenClick",
                    )}
                  </Localized>{" "}
                  <strong className="text-foreground">
                    <Localized>{t("messages.setUpMfa")}</Localized>
                  </strong>
                  .
                </li>
                <li>
                  <Localized>
                    {t(
                      "messages.inTheAppAddAnAccountAndScanThe",
                    )}
                  </Localized>{" "}
                  <strong className="text-foreground">
                    <Localized>{"messages.myDailyPage"}</Localized>
                  </strong>{" "}
                  <Localized>{t("messages.accountWillBeAdded")}</Localized>
                </li>
                <li>
                  <Localized>
                    {t(
                      "messages.saveTheRecoveryCodesThenEnterTheSixDigit",
                    )}
                  </Localized>
                </li>
              </ol>
              <p className="text-xs text-muted-foreground">
                <Localized>
                  {t(
                    "messages.theCodeChangesEvery30SecondsNoSmsIs",
                  )}
                </Localized>
              </p>
            </div>
          )}
          {!setup && (
            <div className="space-y-2">
              <label
                htmlFor="mfa-password"
                className={errors.password ? "text-destructive" : ""}
              >
                <Localized>{t("messages.currentPassword")}</Localized>
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
                      password: t("messages.atLeast8Characters"),
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
                <Localized>
                  {t("messages.1AddMyDailyPageToAuthenticator")}
                </Localized>
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
                    aria-label={t(
                      "messages.mfaSetupQrCodeToScanInYourAuthenticator",
                    )}
                    className="h-auto max-w-full"
                  />
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <Localized>
                      {t(
                        "messages.openAuthenticatorAddAnAccountAndSelectQrScanning",
                      )}
                    </Localized>
                  </p>
                  <p>
                    <Localized>{t("messages.theAccount")}</Localized>{" "}
                    <strong className="text-foreground">
                      <Localized>{"messages.myDailyPage"}</Localized>
                    </strong>{" "}
                    <Localized>
                      {t(
                        "messages.showsASixDigitCodeThatRefreshesEvery30",
                      )}
                    </Localized>
                  </p>
                  <p>
                    <Localized>
                      {t(
                        "messages.theQrCodeIsGeneratedInYourBrowserWithout",
                      )}
                    </Localized>
                  </p>
                  <p className="font-medium text-foreground">
                    <Localized>
                      {t(
                        "messages.setupExpiresAfterTenMinutesIfItExpiresCancel",
                      )}
                    </Localized>
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.cannotScanOrUsingTheSamePhoneAddAn",
                  )}
                </Localized>
              </p>
              <label htmlFor="mfa-secret" className="text-sm font-medium">
                <Localized>{t("messages.setupKey")}</Localized>
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
                  aria-label={t("messages.copySetupKey")}
                >
                  <Copy />
                </Button>
              </div>
              <h3 className="font-medium">
                <Localized>
                  {t("messages.2SaveYourRecoveryCodes")}
                </Localized>
              </h3>
              <p className="text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.keepTheseCodesSafeTheyWillNotBeShown",
                  )}
                </Localized>
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
                  <Localized>{t("messages.copyCodes")}</Localized>
                </Button>
                <Button variant="outline" onClick={download}>
                  <Download />
                  <Localized>{t("messages.downloadCodes")}</Localized>
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
                <Localized>
                  {t("messages.iHaveSavedMyRecoveryCodes")}
                </Localized>
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
                  ? t("messages.authenticationOrRecoveryCode")
                  : t("messages.3EnterTheAppSSixDigitCode")}
              </label>
              <Input
                id="mfa-confirm-code"
                value={code}
                maxLength={64}
                autoComplete="one-time-code"
                placeholder={
                  enabled
                    ? t("messages.sixDigitOrRecoveryCode")
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
                ? t("messages.verifying")
                : enabled
                  ? t("messages.disableMfa2")
                  : setup
                    ? "Confirmer l’activation"
                    : t("messages.setUpMfa")}
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
                <Localized>{t("messages.cancelSetup")}</Localized>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            <Localized>
              {t(
                "messages.enablingOrDisablingMfaSignsYouOutOnAll",
              )}
            </Localized>
          </p>
        </>
      )}
    </section>
  );
}
