"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { cn } from "@/lib/utils";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { signInSchema } from "@/schemas/auth.schema";

import { FeedbackState } from "@/components/ui/feedback-state";
import { loginCredentials, normalizeMfaCode } from "@/lib/login-credentials";
import { loginErrorMessage } from "@/lib/login-error";

const rememberedEmailKey = "my-daily-page:remembered-email";

const loginFields = ["email", "password"] as const;

const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div"> = {}) => {
  const t = useTranslator();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof loginFields)[number], string>>
  >({});
  const [suspensionError, setSuspensionError] = React.useState("");
  const [showMfa, setShowMfa] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [recoveryMode, setRecoveryMode] = React.useState(false);
  const [codeError, setCodeError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedEmail = localStorage.getItem(rememberedEmailKey);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        // Sign-in remains available when browser storage is blocked.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const callbackUrl =
    typeof router.query.callbackUrl === "string" &&
    router.query.callbackUrl.startsWith("/") &&
    !router.query.callbackUrl.startsWith("//")
      ? router.query.callbackUrl
      : "/dashboard/today";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, loginFields));
      return;
    }

    if (showMfa) {
      const normalized = normalizeMfaCode(code) ?? "";
      if (
        !(recoveryMode
          ? /^[a-f0-9]{32}$/i.test(normalized.replace(/-/g, ""))
          : /^\d{6}$/.test(normalized))
      ) {
        setCodeError(
          recoveryMode
            ? t("messages.enterACompleteRecoveryCode")
            : t("messages.enterTheSixDigitsShownInAuthenticator"),
        );
        return;
      }
    }
    setCodeError("");
    setFieldErrors({});
    setSuspensionError("");
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        ...loginCredentials(parsed.data, showMfa ? code : undefined),
        redirect: false,
        callbackUrl,
      });
      if (!result || result.error) {
        if (result?.code === "mfa_required") {
          setCode("");
          setRecoveryMode(false);
          setShowMfa(true);
          return;
        }
        if (result?.code?.startsWith("mfa_")) {
          setShowMfa(true);
          const message = loginErrorMessage(result.code);
          setCodeError(message);
          setCode("");
          toast.error(message);
          return;
        }
        if (result?.code === "account_suspended")
          setSuspensionError(loginErrorMessage(result.code));
        else toast.error(loginErrorMessage(result?.code));
        return;
      }
    } catch {
      toast.error(loginErrorMessage("service_unavailable"));
      return;
    } finally {
      setIsLoading(false);
    }

    try {
      if (rememberMe)
        localStorage.setItem(rememberedEmailKey, parsed.data.email);
      else localStorage.removeItem(rememberedEmailKey);
    } catch {
      // Remembering an email is optional and must not prevent sign-in.
    }
    toast.success(t("messages.signedInSuccessfully"));
    await router.push(callbackUrl);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/70 bg-card/90 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {showMfa ? t("messages.twoStepVerification") : t("auth.signIn")}
          </CardTitle>
          <CardDescription>
            {showMfa
              ? t(
                  "messages.step2Of2EnterYourMyDailyPage",
                )
              : t("messages.step1EnterYourEmailAndPassword")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {!showMfa && (
                <>
                  <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
                    <FieldLabel htmlFor="email">
                      <Localized>
                        <Localized>{"auth.email"}</Localized>
                      </Localized>
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="username"
                      placeholder="demo@mydailypage.dev"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowMfa(false);
                        setCode("");
                        setCodeError("");
                        setSuspensionError("");
                        setFieldErrors((errors) =>
                          requiredFieldError(errors, "email", e.target.value),
                        );
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "email-error" : undefined
                      }
                      disabled={isLoading}
                    />
                    {fieldErrors.email ? (
                      <FieldError id="email-error">
                        {fieldErrors.email}
                      </FieldError>
                    ) : null}
                  </Field>
                  <Field
                    data-invalid={Boolean(fieldErrors.password) || undefined}
                  >
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">
                        <Localized>{t("auth.password")}</Localized>
                      </FieldLabel>
                      <Link
                        href="/auth/forgot.password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        <Localized>{t("auth.forgotPassword")}</Localized>
                      </Link>
                    </div>
                    <InputPassword
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setShowMfa(false);
                        setCode("");
                        setCodeError("");
                        setSuspensionError("");
                        setFieldErrors((errors) =>
                          requiredFieldError(
                            errors,
                            "password",
                            e.target.value,
                          ),
                        );
                      }}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password ? "password-error" : undefined
                      }
                      disabled={isLoading}
                    />
                    {fieldErrors.password ? (
                      <FieldError id="password-error">
                        {fieldErrors.password}
                      </FieldError>
                    ) : null}
                  </Field>
                  <Field>
                    <label
                      htmlFor="remember-me"
                      className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                    >
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="size-4 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                        checked={rememberMe}
                        disabled={isLoading}
                        aria-describedby="remember-me-help"
                        onChange={(event) => {
                          setRememberMe(event.target.checked);
                          if (!event.target.checked) {
                            try {
                              localStorage.removeItem(rememberedEmailKey);
                            } catch {
                              /* Storage may be disabled. */
                            }
                          }
                        }}
                      />
                      <Localized>{t("auth.rememberMe")}</Localized>
                    </label>
                  </Field>
                </>
              )}
              {showMfa && (
                <Field data-invalid={!!codeError}>
                  <FieldLabel htmlFor="mfa-code">
                    {recoveryMode
                      ? t("messages.recoveryCode")
                      : t("messages.authenticatorCode")}
                  </FieldLabel>
                  <Input
                    id="mfa-code"
                    autoComplete="one-time-code"
                    placeholder={
                      recoveryMode
                        ? t("messages.singleUseRecoveryCode")
                        : "000000"
                    }
                    inputMode={recoveryMode ? "text" : "numeric"}
                    autoFocus
                    maxLength={recoveryMode ? 64 : 16}
                    className={
                      recoveryMode
                        ? "font-mono"
                        : "text-center text-2xl tracking-[0.4em] font-mono"
                    }
                    value={code}
                    disabled={isLoading}
                    onChange={(event) => {
                      setCode(
                        recoveryMode
                          ? event.target.value
                          : event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      setCodeError("");
                    }}
                    onBlur={() => {
                      if (!code.trim())
                        setCodeError(t("messages.verificationCodeRequired"));
                    }}
                    aria-invalid={!!codeError}
                    aria-describedby={
                      codeError
                        ? "mfa-code-help mfa-code-error"
                        : "mfa-code-help"
                    }
                  />
                  <FieldDescription id="mfa-code-help">
                    <Localized>
                      {t(
                        "messages.useAFreshCodeForMyDailyPageIn",
                      )}
                    </Localized>
                  </FieldDescription>
                  {codeError && (
                    <FieldError id="mfa-code-error">{codeError}</FieldError>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 justify-start"
                    disabled={isLoading}
                    onClick={() => {
                      setRecoveryMode(!recoveryMode);
                      setCode("");
                      setCodeError("");
                    }}
                  >
                    {recoveryMode
                      ? "Utiliser Authenticator"
                      : t("messages.useARecoveryCode")}
                  </Button>
                </Field>
              )}
              {suspensionError && (
                <FeedbackState
                  variant="error"
                  description={suspensionError}
                  className="rounded-lg border border-destructive/20 bg-destructive/5 py-4"
                />
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? t("messages.verifying")
                    : showMfa
                      ? t("messages.verifyAndSignIn")
                      : t("messages.continue")}
                </Button>
                {showMfa ? (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setShowMfa(false);
                      setCode("");
                      setCodeError("");
                      setRecoveryMode(false);
                    }}
                  >
                    <Localized>{t("messages.backToCredentials")}</Localized>
                  </Button>
                ) : (
                  <Button variant="outline" type="button" disabled>
                    <Localized>{t("messages.googleComingSoon")}</Localized>
                  </Button>
                )}
                <FieldDescription className="text-center">
                  <Localized>{t("messages.noAccountYet")}</Localized>{" "}
                  <Link href="/auth/signup">
                    <Localized>{t("auth.signUp")}</Localized>
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
