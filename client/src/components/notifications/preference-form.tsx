"use client";

import { ActivationLabel } from "@/components/ui/activation-label";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Save, Undo2 } from "lucide-react";

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

export function PreferenceForm(props: PreferenceFormProps) {
  return props.open ? (
    <PreferenceFormContent key={props.preference?.id ?? "new"} {...props} />
  ) : null;
}

function PreferenceFormContent({
  open,
  onOpenChange,
  preference,
  availableChannels,
  isSubmitting = false,
  onCreate,
  onUpdate,
}: PreferenceFormProps) {
  const [channel, setChannel] = React.useState<NotifChannel | "">(
    preference?.channel ?? availableChannels[0] ?? "",
  );
  const [whatsappOptIn, setWhatsappOptIn] = React.useState(
    preference?.whatsappOptIn ?? false,
  );
  const [enabled, setEnabled] = React.useState(preference?.enabled ?? true);
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof createFields)[number], string>>
  >({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (preference) {
      const parsed = updateNotificationPreferenceSchema.safeParse({
        enabled,
        whatsappOptIn,
      });
      if (!parsed.success) return;
      await onUpdate(parsed.data);
      return;
    }

    const parsed = createNotificationPreferenceSchema.safeParse({
      channel,
      enabled,
      whatsappOptIn,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, createFields));
      return;
    }

    setFieldErrors({});
    await onCreate(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle>
            {preference ? "Modifier la préférence" : "Nouvelle préférence"}
          </DialogTitle>
          <DialogDescription>
            {preference
              ? "Le canal ne change pas. Tu peux activer ou désactiver les envois."
              : "Un canal par compte. Les rappels n’utilisent que les canaux activés."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldErrors.channel) || undefined}>
                <FieldLabel htmlFor="preference-channel">Canal</FieldLabel>
                {preference ? (
                  <Select value={preference.channel} disabled>
                    <SelectTrigger id="preference-channel" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={preference.channel}>
                        {notifChannelLabels[preference.channel]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  <ActivationLabel enabled={enabled} />
                </Button>
              </Field>
              {(preference?.channel ?? channel) === "whatsapp" ? (
                <Field>
                  <label
                    className="flex items-start gap-2 text-sm"
                    htmlFor="whatsapp-opt-in"
                  >
                    <input
                      id="whatsapp-opt-in"
                      type="checkbox"
                      checked={whatsappOptIn}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        setWhatsappOptIn(event.target.checked)
                      }
                    />
                    J’accepte de recevoir les rappels de mes tâches sur
                    WhatsApp.
                  </label>
                </Field>
              ) : null}
            </FieldGroup>
          </div>

          <DialogFooter className="mt-0 flex-row justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting
                ? "Enregistrement…"
                : preference
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
