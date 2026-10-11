"use client";

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
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { cn } from "@/lib/utils";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { signInSchema } from "@/schemas/auth.schema";

const rememberedEmailKey = "my-daily-page:remembered-email";

const loginFields = ["email", "password"] as const;

const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div"> = {}) => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof loginFields)[number], string>>
  >({});
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

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, loginFields));
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      callbackUrl
    });
    setIsLoading(false);

    if (!result || result.error) {
      toast.error("Email ou mot de passe incorrect");
      return;
    }

    try {
      if (rememberMe)
        localStorage.setItem(rememberedEmailKey, parsed.data.email);
      else localStorage.removeItem(rememberedEmailKey);
    } catch {
      // Remembering an email is optional and must not prevent sign-in.
    }
    toast.success("Connexion réussie");
    await router.push(callbackUrl);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/70 bg-card/90 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Connexion
          </CardTitle>
          <CardDescription>
            Retrouve tes tâches et reprends ta journée là où tu l’as laissée.
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
                  name="email"
                  autoComplete="username"
                  placeholder="demo@mydailypage.dev"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "email", e.target.value)
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <Link
                    href="/auth/forgot.password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
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
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "password", e.target.value)
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
                  Se souvenir de moi
                </label>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Connexion…" : "Se connecter"}
                </Button>
                <Button variant="outline" type="button" disabled>
                  Google — bientôt
                </Button>
                <FieldDescription className="text-center">
                  Pas encore de compte ?{" "}
                  <Link href="/auth/signup">Créer un compte</Link>
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
