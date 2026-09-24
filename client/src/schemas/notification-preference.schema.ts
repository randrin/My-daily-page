import { z } from "zod";

export const notifChannels = ["email", "sms", "whatsapp"] as const;

export const notifChannelSchema = z.enum(notifChannels, {
  error: "Ce champ est requis",
});

export const notificationPreferenceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  channel: notifChannelSchema,
  enabled: z.boolean(),
});

export const createNotificationPreferenceSchema = z.object({
  channel: notifChannelSchema,
  enabled: z.boolean(),
});

export const updateNotificationPreferenceSchema = z.object({
  enabled: z.boolean(),
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
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};
