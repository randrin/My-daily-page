"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { InputPassword } from "@/components/ui/input-password";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { useChangePassword } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import { changePasswordSchema } from "@/schemas/profile.schema";
import { Save, Undo2 } from "lucide-react";

const passwordFields = [
  "currentPassword",
  "newPassword",
  "confirmPassword"
] as const;

interface ChangePasswordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordSheet({
  open,
  onOpenChange
}: ChangePasswordSheetProps) {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof passwordFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, passwordFields));
      return;
    }

    setFieldErrors({});
    try {
      await changePassword.mutateAsync({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword
      });
      toast.success("Mot de passe mis à jour");
      setTimeout(() => onOpenChange(false), 0);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de changer le mot de passe")
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>Changer le mot de passe</SheetTitle>
          <SheetDescription>
            Saisis ton mot de passe actuel, puis un nouveau (8 caractères min.).
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
                  Mot de passe actuel
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
                        event.target.value
                      )
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
                  Nouveau mot de passe
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
                        event.target.value
                      )
                    );
                  }}
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  aria-describedby={
                    fieldErrors.newPassword ? "new-password-error" : undefined
                  }
                  disabled={changePassword.isPending}
                />
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
                  Confirmer le mot de passe
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
                        event.target.value
                      )
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
              Annuler
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {changePassword.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
