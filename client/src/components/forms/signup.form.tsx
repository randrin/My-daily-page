"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
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
import {
  omitFieldError,
  requiredFieldError,
  zodFieldErrors,
} from "@/lib/field-errors";
import { registerRequest } from "@/api/auth";
import { signUpSchema } from "@/schemas/auth.schema";

const signupFields = [
  "email",
  "password",
  "confirmPassword",
  "phoneNumber",
] as const;

const SignupForm = ({
  className,
  ...props
}: React.ComponentProps<"div"> = {}) => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof signupFields)[number], string>>
  >({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = signUpSchema.safeParse({
      email,
      password,
      confirmPassword,
      phoneNumber: phoneNumber || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, signupFields));
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      await registerRequest(parsed.data);
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (!result || result.error) {
        toast.success("Compte créé. Connecte-toi.");
        await router.push("/auth/signin");
        return;
      }
      toast.success("Compte créé");
      await router.push("/dashboard");
    } catch {
      toast.error("Impossible de créer le compte. Email déjà utilisé ?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>
            Email + mot de passe (8 caractères min.). Tes tâches resteront
            isolées à ton compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
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
                  <FieldError id="email-error">{fieldErrors.email}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={Boolean(fieldErrors.password) || undefined}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <InputPassword
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "password", e.target.value),
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
              <Field
                data-invalid={Boolean(fieldErrors.confirmPassword) || undefined}
              >
                <FieldLabel htmlFor="confirmPassword">Confirmation</FieldLabel>
                <InputPassword
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(
                        errors,
                        "confirmPassword",
                        e.target.value,
                      ),
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  disabled={isLoading}
                />
                {fieldErrors.confirmPassword ? (
                  <FieldError id="confirm-password-error">
                    {fieldErrors.confirmPassword}
                  </FieldError>
                ) : null}
              </Field>
              <Field
                data-invalid={Boolean(fieldErrors.phoneNumber) || undefined}
              >
                <FieldLabel htmlFor="phoneNumber">
                  Téléphone (optionnel, SMS)
                </FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+33600000000"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setFieldErrors((errors) =>
                      omitFieldError(errors, "phoneNumber"),
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.phoneNumber)}
                  aria-describedby={
                    fieldErrors.phoneNumber ? "phone-error" : undefined
                  }
                  disabled={isLoading}
                />
                {fieldErrors.phoneNumber ? (
                  <FieldError id="phone-error">
                    {fieldErrors.phoneNumber}
                  </FieldError>
                ) : null}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Création…" : "Créer mon compte"}
                </Button>
                <FieldDescription className="text-center">
                  Déjà un compte ? <Link href="/auth/signin">Se connecter</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
