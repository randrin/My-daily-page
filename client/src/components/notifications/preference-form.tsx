"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { zodFieldErrors } from "@/lib/field-errors";
import {
  createNotificationPreferenceSchema,
  notifChannelLabels,
  updateNotificationPreferenceSchema,
  type CreateNotificationPreferenceInput,
  type NotifChannel,
  type NotificationPreference,
  type UpdateNotificationPreferenceInput,
} from "@/schemas/notification-preference.schema";

const createFields = ["channel"] as const;

interface PreferenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preference?: NotificationPreference | null;
  availableChannels: NotifChannel[];
  isSubmitting?: boolean;
  onCreate: (input: CreateNotificationPreferenceInput) => Promise<void> | void;
  onUpdate: (input: UpdateNotificationPreferenceInput) => Promise<void> | void;
}

export function PreferenceForm({
  open,
  onOpenChange,
  preference,
  availableChannels,
  isSubmitting = false,
  onCreate,
  onUpdate,
}: PreferenceFormProps) {
  const [channel, setChannel] = React.useState<NotifChannel | "">("");
  const [enabled, setEnabled] = React.useState(true);
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof createFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open) return;
    setChannel(preference?.channel ?? availableChannels[0] ?? "");
    setEnabled(preference?.enabled ?? true);
    setFieldErrors({});
  }, [open, preference, availableChannels]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (preference) {
      const parsed = updateNotificationPreferenceSchema.safeParse({ enabled });
      if (!parsed.success) return;
      await onUpdate(parsed.data);
      return;
    }

    const parsed = createNotificationPreferenceSchema.safeParse({
      channel,
      enabled,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, createFields));
      return;
    }

    setFieldErrors({});
    await onCreate(parsed.data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>
            {preference
              ? "Modifier la préférence"
              : "Nouvelle préférence"}
          </SheetTitle>
          <SheetDescription>
            {preference
              ? "Le canal ne change pas. Tu peux activer ou désactiver les envois."
              : "Un canal par compte. Les rappels n’utilisent que les canaux activés."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldErrors.channel) || undefined}>
                <FieldLabel htmlFor="preference-channel">Canal</FieldLabel>
                {preference ? (
                  <p className="text-sm font-medium">
                    {notifChannelLabels[preference.channel]}
                  </p>
                ) : (
                  <Select
                    value={channel}
                    onValueChange={(value) => {
                      setChannel(value as NotifChannel);
                      setFieldErrors((errors) => {
                        if (!errors.channel) return errors;
                        const next = { ...errors };
                        delete next.channel;
                        return next;
                      });
                    }}
                    disabled={isSubmitting || availableChannels.length === 0}
                  >
                    <SelectTrigger
                      id="preference-channel"
                      className="w-full"
                      aria-invalid={Boolean(fieldErrors.channel)}
                      aria-describedby={
                        fieldErrors.channel
                          ? "preference-channel-error"
                          : undefined
                      }
                    >
                      <SelectValue placeholder="Choisir un canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChannels.map((item) => (
                        <SelectItem key={item} value={item}>
                          {notifChannelLabels[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldErrors.channel ? (
                  <FieldError id="preference-channel-error">
                    {fieldErrors.channel}
                  </FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="preference-enabled">Statut</FieldLabel>
                <Button
                  id="preference-enabled"
                  type="button"
                  variant={enabled ? "default" : "outline"}
                  className="w-full"
                  aria-pressed={enabled}
                  disabled={isSubmitting}
                  onClick={() => setEnabled((value) => !value)}
                >
                  {enabled ? "Activé" : "Désactivé"}
                </Button>
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement…"
                : preference
                  ? "Enregistrer"
                  : "Créer la préférence"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
