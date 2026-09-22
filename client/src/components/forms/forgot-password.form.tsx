"use client";

import React from "react";
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
  const [email, setEmail] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof forgotPasswordFields)[number], string>>
  >({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, forgotPasswordFields));
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    // TODO: Implement forgot password logic
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password reset link has been sent to your email");
      setEmail("");
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password
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
                  placeholder="m@example.com"
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
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <a
                    href="/auth/signin"
                    className="underline-offset-4 hover:underline"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
