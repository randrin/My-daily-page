"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useUpdateProfile } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  omitFieldError,
  requiredFieldError,
  zodFieldErrors,
} from "@/lib/field-errors";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import {
  PROFILE_TIMEZONES,
  profileFormSchema,
} from "@/schemas/profile.schema";

const profileFields = [
  "email",
  "phoneNumber",
  "whatsappNumber",
  "timezone",
] as const;

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileSheet({
  open,
  onOpenChange,
}: EditProfileSheetProps) {
  const { update } = useSession();
  const meQuery = useMe(open);
  const updateProfile = useUpdateProfile();
  const me = meQuery.data;
  const showSkeleton = showQuerySkeleton(meQuery);

  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [timezone, setTimezone] = React.useState("Europe/Paris");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof profileFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open || !me) return;
    setEmail(me.email);
    setPhoneNumber(me.phoneNumber ?? "");
    setWhatsappNumber(me.whatsappNumber ?? "");
    setTimezone(me.timezone || "Europe/Paris");
    setFieldErrors({});
  }, [open, me]);

  const timezones = React.useMemo(() => {
    if (
      timezone &&
      !(PROFILE_TIMEZONES as readonly string[]).includes(timezone)
    ) {
      return [timezone, ...PROFILE_TIMEZONES];
    }
    return [...PROFILE_TIMEZONES];
  }, [timezone]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = profileFormSchema.safeParse({
      email,
      phoneNumber: phoneNumber || undefined,
      whatsappNumber: whatsappNumber || undefined,
      timezone,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, profileFields));
      return;
    }

    setFieldErrors({});
    try {
      const profile = await updateProfile.mutateAsync(parsed.data);
      if (profile.email !== me?.email) {
        await update({ email: profile.email });
      }
      toast.success("Profil mis à jour");
      setTimeout(() => onOpenChange(false), 0);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer le profil"),
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>Modifier le profil</SheetTitle>
          <SheetDescription>
            Email, téléphones et fuseau horaire de ton compte.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {meQuery.isError ? (
              <p className="text-sm text-destructive">
                Impossible de charger le profil.
              </p>
            ) : showSkeleton ? (
              <div className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <FieldGroup className="gap-5">
                <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((errors) =>
                        requiredFieldError(errors, "email", event.target.value),
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "profile-email-error" : undefined
                    }
                    disabled={updateProfile.isPending}
                  />
                  {fieldErrors.email ? (
                    <FieldError id="profile-email-error">
                      {fieldErrors.email}
                    </FieldError>
                  ) : null}
                </Field>

                <Field
                  data-invalid={Boolean(fieldErrors.phoneNumber) || undefined}
                >
                  <FieldLabel htmlFor="profile-phone">Téléphone</FieldLabel>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+33600000000"
                    value={phoneNumber}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "phoneNumber"),
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                    aria-describedby={
                      fieldErrors.phoneNumber
                        ? "profile-phone-error"
                        : undefined
                    }
                    disabled={updateProfile.isPending}
                  />
                  {fieldErrors.phoneNumber ? (
                    <FieldError id="profile-phone-error">
                      {fieldErrors.phoneNumber}
                    </FieldError>
                  ) : null}
                </Field>

                <Field
                  data-invalid={
                    Boolean(fieldErrors.whatsappNumber) || undefined
                  }
                >
                  <FieldLabel htmlFor="profile-whatsapp">WhatsApp</FieldLabel>
                  <Input
                    id="profile-whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+33600000000"
                    value={whatsappNumber}
                    onChange={(event) => {
                      setWhatsappNumber(event.target.value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "whatsappNumber"),
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.whatsappNumber)}
                    aria-describedby={
                      fieldErrors.whatsappNumber
                        ? "profile-whatsapp-error"
                        : undefined
                    }
                    disabled={updateProfile.isPending}
                  />
                  {fieldErrors.whatsappNumber ? (
                    <FieldError id="profile-whatsapp-error">
                      {fieldErrors.whatsappNumber}
                    </FieldError>
                  ) : null}
                </Field>

                <Field
                  data-invalid={Boolean(fieldErrors.timezone) || undefined}
                >
                  <FieldLabel htmlFor="profile-timezone">
                    Fuseau horaire
                  </FieldLabel>
                  <select
                    id="profile-timezone"
                    value={timezone}
                    onChange={(event) => {
                      setTimezone(event.target.value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "timezone"),
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.timezone)}
                    aria-describedby={
                      fieldErrors.timezone
                        ? "profile-timezone-error"
                        : undefined
                    }
                    disabled={updateProfile.isPending}
                    className={cn(
                      "border-input dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none",
                      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {timezones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.timezone ? (
                    <FieldError id="profile-timezone-error">
                      {fieldErrors.timezone}
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            )}
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProfile.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                updateProfile.isPending || showSkeleton || meQuery.isError
              }
            >
              {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
