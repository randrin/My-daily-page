"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PhoneNumber } from "@/components/ui/phone-number";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useUpdateProfile } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  omitFieldError,
  requiredFieldError,
  zodFieldErrors
} from "@/lib/field-errors";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { PROFILE_TIMEZONES, profileFormSchema } from "@/schemas/profile.schema";
import { Save, Undo2 } from "lucide-react";

const profileFields = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "whatsappNumber",
  "timezone"
] as const;

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileSheet({
  open,
  onOpenChange
}: EditProfileSheetProps) {
  const { update } = useSession();
  const meQuery = useMe(open);
  const updateProfile = useUpdateProfile();
  const me = meQuery.data;
  const showSkeleton = showQuerySkeleton(meQuery);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [timezone, setTimezone] = React.useState("Europe/Paris");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof profileFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open || !me) return;
    setFirstName(me.firstName ?? "");
    setLastName(me.lastName ?? "");
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
      firstName,
      lastName,
      email,
      phoneNumber,
      whatsappNumber: whatsappNumber || undefined,
      timezone
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
        getApiErrorMessage(error, "Impossible d’enregistrer le profil")
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>Modifier le profil</SheetTitle>
          <SheetDescription>
            Prénom, nom, email, téléphones et fuseau horaire de ton compte.
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
                <Field
                  data-invalid={Boolean(fieldErrors.firstName) || undefined}
                >
                  <FieldLabel htmlFor="profile-firstName">Prénom</FieldLabel>
                  <Input
                    id="profile-firstName"
                    autoComplete="given-name"
                    maxLength={100}
                    value={firstName}
                    placeholder="John"
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "firstName")
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    aria-describedby={
                      fieldErrors.firstName
                        ? "profile-firstName-error"
                        : undefined
                    }
                    disabled={updateProfile.isPending}
                  />
                  {fieldErrors.firstName ? (
                    <FieldError id="profile-firstName-error">
                      {fieldErrors.firstName}
                    </FieldError>
                  ) : null}
                </Field>
                <Field
                  data-invalid={Boolean(fieldErrors.lastName) || undefined}
                >
                  <FieldLabel htmlFor="profile-lastName">Nom</FieldLabel>
                  <Input
                    id="profile-lastName"
                    autoComplete="family-name"
                    maxLength={100}
                    value={lastName}
                    placeholder="Doe"
                    onChange={(event) => {
                      setLastName(event.target.value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "lastName")
                      );
                    }}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    aria-describedby={
                      fieldErrors.lastName
                        ? "profile-lastName-error"
                        : undefined
                    }
                    disabled={updateProfile.isPending}
                  />
                  {fieldErrors.lastName ? (
                    <FieldError id="profile-lastName-error">
                      {fieldErrors.lastName}
                    </FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={Boolean(fieldErrors.email) || undefined}>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    placeholder="4Eh0Z@example.com"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((errors) =>
                        requiredFieldError(errors, "email", event.target.value)
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
                  <PhoneNumber
                    id="profile-phone"
                    required
                    aria-required="true"
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "phoneNumber")
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
                  <PhoneNumber
                    id="profile-whatsapp"
                    value={whatsappNumber}
                    onChange={(value) => {
                      setWhatsappNumber(value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "whatsappNumber")
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
                  <Select
                    value={timezone}
                    onValueChange={(value) => {
                      setTimezone(value);
                      setFieldErrors((errors) =>
                        omitFieldError(errors, "timezone")
                      );
                    }}
                    disabled={updateProfile.isPending}
                  >
                    <SelectTrigger
                      id="profile-timezone"
                      className="w-full"
                      aria-invalid={Boolean(fieldErrors.timezone)}
                      aria-describedby={
                        fieldErrors.timezone
                          ? "profile-timezone-error"
                          : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Undo2 className="size-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                updateProfile.isPending || showSkeleton || meQuery.isError
              }
            >
              <Save className="size-4 mr-2" />
              {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
