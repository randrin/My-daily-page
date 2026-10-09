import { z } from "zod";

export const notifChannels = ["email", "sms", "whatsapp", "push"] as const;

export const notifChannelSchema = z.enum(notifChannels, {
  error: "Ce champ est requis",
});

export const notificationPreferenceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  channel: notifChannelSchema,
  enabled: z.boolean(),
  whatsappOptIn: z.boolean().optional(),
});

export const createNotificationPreferenceSchema = z.object({
  channel: notifChannelSchema,
  enabled: z.boolean(),
  whatsappOptIn: z.boolean().optional(),
});

export const updateNotificationPreferenceSchema = z.object({
  enabled: z.boolean(),
  whatsappOptIn: z.boolean().optional(),
});

export type NotifChannel = z.infer<typeof notifChannelSchema>;
export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;
export type CreateNotificationPreferenceInput = z.infer<
  typeof createNotificationPreferenceSchema
>;
export type UpdateNotificationPreferenceInput = z.infer<
  typeof updateNotificationPreferenceSchema
>;

export const notifChannelLabels: Record<NotifChannel, string> = {
  push: "Push",
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};
