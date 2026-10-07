import { z } from "zod";
import { apiClient } from "@/api/client";
import {
  notificationPreferenceSchema,
  type CreateNotificationPreferenceInput,
  type NotificationPreference,
  type UpdateNotificationPreferenceInput,
} from "@/schemas/notification-preference.schema";

const settingsSchema = z.object({ notificationsEnabled: z.boolean() });

const preferencesSchema = z.array(notificationPreferenceSchema);

export const notificationPreferencesApi = {
  getSettings: async () => {
    const { data } = await apiClient.get("/notification-preferences/settings");
    return settingsSchema.parse(data);
  },
  updateSettings: async (notificationsEnabled: boolean) => {
    const { data } = await apiClient.patch("/notification-preferences/settings", { notificationsEnabled });
    return settingsSchema.parse(data);
  },
  getAll: async (): Promise<NotificationPreference[]> => {
    const { data } = await apiClient.get("/notification-preferences");
    return preferencesSchema.parse(data);
  },

  getById: async (id: string): Promise<NotificationPreference> => {
    const { data } = await apiClient.get(`/notification-preferences/${id}`);
    return notificationPreferenceSchema.parse(data);
  },

  create: async (
    input: CreateNotificationPreferenceInput,
  ): Promise<NotificationPreference> => {
    const { data } = await apiClient.post("/notification-preferences", input);
    return notificationPreferenceSchema.parse(data);
  },

  update: async (
    id: string,
    input: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreference> => {
    const { data } = await apiClient.patch(
      `/notification-preferences/${id}`,
      input,
    );
    return notificationPreferenceSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notification-preferences/${id}`);
  },
};
