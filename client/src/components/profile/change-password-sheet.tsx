"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordStrength } from "@/components/ui/password-strength";
import { InputPassword } from "@/components/ui/input-password";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChangePassword } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { changePasswordSchema } from "@/schemas/profile.schema";
import { Save, Undo2 } from "lucide-react";

const passwordFields = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

interface ChangePasswordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordSheet({
  open,
  onOpenChange,
}: ChangePasswordSheetProps) {
  const t = useTranslator();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof passwordFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, passwordFields));
      return;
    }

    setFieldErrors({});
    try {
      await changePassword.mutateAsync({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });
      toast.success(t("messages.passwordUpdated"));
      setTimeout(() => onOpenChange(false), 0);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de changer le mot de passe"),
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>
            <Localized>{t("messages.changePassword")}</Localized>
          </SheetTitle>
          <SheetDescription>
            <Localized>
              {t(
                "messages.enterYourCurrentPasswordThenANewOneAt",
              )}
            </Localized>
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field
                data-invalid={Boolean(fieldErrors.currentPassword) || undefined}
              >
                <FieldLabel htmlFor="current-password">
                  <Localized>{t("messages.currentPassword")}</Localized>
                </FieldLabel>
                <InputPassword
                  id="current-password"
                  autoComplete="current-password"
                  value={currentPassword}
                  placeholder="Entre ton mot de passe actuel"
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(
                        errors,
                        "currentPassword",
                        event.target.value,
                      ),
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.currentPassword)}
                  aria-describedby={
                    fieldErrors.currentPassword
                      ? "current-password-error"
                      : undefined
                  }
                  disabled={changePassword.isPending}
                />
                {fieldErrors.currentPassword ? (
                  <FieldError id="current-password-error">
                    {fieldErrors.currentPassword}
                  </FieldError>
                ) : null}
              </Field>

              <Field
                data-invalid={Boolean(fieldErrors.newPassword) || undefined}
              >
                <FieldLabel htmlFor="new-password">
                  <Localized>{t("messages.newPassword")}</Localized>
                </FieldLabel>
                <InputPassword
                  id="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  placeholder="Entre ton nouveau mot de passe"
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(
                        errors,
                        "newPassword",
                        event.target.value,
                      ),
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  aria-describedby={
                    [
                      newPassword.length > 0
                        ? "change-password-strength"
                        : null,
                      fieldErrors.newPassword ? "new-password-error" : null,
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  disabled={changePassword.isPending}
                />
                {newPassword.length > 0 && (
                  <PasswordStrength
                    password={newPassword}
                    id="change-password-strength"
                  />
                )}
                {fieldErrors.newPassword ? (
                  <FieldError id="new-password-error">
                    {fieldErrors.newPassword}
                  </FieldError>
                ) : null}
              </Field>

              <Field
                data-invalid={Boolean(fieldErrors.confirmPassword) || undefined}
              >
                <FieldLabel htmlFor="confirm-password">
                  <Localized>{t("messages.confirmPassword")}</Localized>
                </FieldLabel>
                <InputPassword
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  placeholder="Confirme ton nouveau mot de passe"
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(
                        errors,
                        "confirmPassword",
                        event.target.value,
                      ),
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  disabled={changePassword.isPending}
                />
                {fieldErrors.confirmPassword ? (
                  <FieldError id="confirm-password-error">
                    {fieldErrors.confirmPassword}
                  </FieldError>
                ) : null}
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changePassword.isPending}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {changePassword.isPending ? "Enregistrement…" : t("common.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
