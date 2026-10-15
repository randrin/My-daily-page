"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { MailCheck, Send } from "lucide-react";
import { forgotPasswordRequest } from "@/api/auth";
import { FeedbackState } from "@/components/ui/feedback-state";
import { CelebrationConfetti } from "@/components/ui/celebration-confetti";
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
import { cn } from "@/lib/utils";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { toast } from "sonner";

const forgotPasswordFields = ["email"] as const;

const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div"> = {}) => {
  const t = useTranslator();
  const [email, setEmail] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof forgotPasswordFields)[number], string>>
  >({});
  const request = useMutation({ mutationFn: forgotPasswordRequest });
  const isLoading = request.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, forgotPasswordFields));
      return;
    }

    setFieldErrors({});
    request.mutate(parsed.data.email, {
      onError: () =>
        toast.error(
          t(
            "messages.unableToSendRequestTryAgainShortly",
          ),
        ),
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/70 bg-card/90 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            <Localized>{t("auth.forgotPassword")}</Localized>
          </CardTitle>
          <CardDescription>
            <Localized>
              {t(
                "messages.enterYourEmailToReceiveALinkAndChoose",
              )}
            </Localized>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {request.isSuccess ? (
            <>
              <CelebrationConfetti />
              <FeedbackState
                icon={MailCheck}
                title="Demande prise en compte"
                description={t(
                  "messages.ifAnAccountMatchesThisAddressYouWillReceive",
                )}
              >
                <Button asChild>
                  <Link href="/auth/signin">
                    <Localized>{t("messages.backToSignIn")}</Localized>
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => request.reset()}>
                  <Localized>{t("messages.useAnotherAddress")}</Localized>
                </Button>
              </FeedbackState>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
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
                    autoComplete="email"
                    placeholder="toi@exemple.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
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
                <Field>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    <Send aria-hidden />
                    {isLoading ? "Envoi de la demande…" : "Recevoir le lien"}
                  </Button>
                  <FieldDescription className="text-center">
                    <Localized>
                      {t("messages.rememberYourPassword")}
                    </Localized>{" "}
                    <Link
                      href="/auth/signin"
                      className="underline-offset-4 hover:underline"
                    >
                      <Localized>{t("messages.signIn")}</Localized>
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
