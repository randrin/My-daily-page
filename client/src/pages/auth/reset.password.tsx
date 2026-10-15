"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/layout/auth.layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { InputPassword } from "@/components/ui/input-password";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { FeedbackState } from "@/components/ui/feedback-state";
import { resetPasswordRequest } from "@/api/auth";
import { requiredPassword } from "@/schemas/auth.schema";
import { zodFieldErrors } from "@/lib/field-errors";
const schema = z
  .object({
    password: requiredPassword.max(72, "72 caractères maximum"),
    confirmPassword: requiredPassword,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });
const fields = ["password", "confirmPassword"] as const;
export default function ResetPasswordScreen() {
  const t = useTranslator();
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : "";
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<
    Partial<Record<(typeof fields)[number], string>>
  >({});
  const mutation = useMutation({ mutationFn: resetPasswordRequest });
  return (
    <AuthLayout variant="recovery">
      <Head>
        <title>
          <Localized>{t("messages.newPasswordMyDailyPage")}</Localized>
        </title>
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <Card className="border-border/70 bg-card/90 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            <Localized>{t("messages.newPassword")}</Localized>
          </CardTitle>
          <CardDescription>
            <Localized>
              {t("messages.chooseAtLeastEightCharactersToProtectYourAccount")}
            </Localized>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mutation.isSuccess ? (
            <FeedbackState
              icon={CheckCircle2}
              title={t("messages.passwordChanged")}
              description="Tu peux maintenant te connecter avec ton nouveau mot de passe."
            >
              <Button asChild>
                <Link href="/auth/signin">
                  <Localized>{t("messages.signIn")}</Localized>
                </Link>
              </Button>
            </FeedbackState>
          ) : router.isReady && !/^[a-f0-9]{64}$/.test(token) ? (
            <FeedbackState
              variant="error"
              description={t(
                "messages.thisLinkIsInvalidRequestANewPasswordReset",
              )}
            >
              <Button asChild>
                <Link href="/auth/forgot.password">
                  <Localized>{t("messages.getANewLink")}</Localized>
                </Link>
              </Button>
            </FeedbackState>
          ) : (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                const result = schema.safeParse(values);
                if (!result.success) {
                  setErrors(zodFieldErrors(result.error, fields));
                  return;
                }
                setErrors({});
                mutation.mutate({ token, password: result.data.password });
              }}
            >
              <FieldGroup>
                {fields.map((field) => (
                  <Field
                    key={field}
                    data-invalid={Boolean(errors[field]) || undefined}
                  >
                    <FieldLabel htmlFor={field}>
                      {field === "password"
                        ? t("messages.newPassword")
                        : "Confirmation"}
                    </FieldLabel>
                    <InputPassword
                      id={field}
                      name={field}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={values[field]}
                      disabled={mutation.isPending}
                      aria-invalid={Boolean(errors[field])}
                      aria-describedby={
                        [
                          field === "password" && values.password.length > 0
                            ? "reset-password-strength"
                            : null,
                          errors[field] ? `${field}-error` : null,
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                      onChange={(event) => {
                        const next = { ...values, [field]: event.target.value };
                        setValues(next);
                        if (errors[field]) {
                          const result = schema.safeParse(next);
                          setErrors(
                            result.success
                              ? {}
                              : zodFieldErrors(result.error, fields),
                          );
                        }
                      }}
                    />
                    {field === "password" && values.password.length > 0 && (
                      <PasswordStrength
                        password={values.password}
                        id="reset-password-strength"
                      />
                    )}
                    {errors[field] && (
                      <FieldError id={`${field}-error`}>
                        {errors[field]}
                      </FieldError>
                    )}
                  </Field>
                ))}
                {mutation.isError && (
                  <FeedbackState
                    variant="error"
                    description={t(
                      "messages.theLinkHasExpiredWasUsedOrTheRequest",
                    )}
                  >
                    <Button asChild variant="outline">
                      <Link href="/auth/forgot.password">
                        <Localized>{t("messages.getANewLink")}</Localized>
                      </Link>
                    </Button>
                  </FeedbackState>
                )}
                <Button
                  type="submit"
                  disabled={mutation.isPending || !router.isReady}
                >
                  {mutation.isPending
                    ? "Enregistrement…"
                    : "Enregistrer le mot de passe"}
                </Button>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
