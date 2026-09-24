import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationPreferencesApi } from "@/api/notification-preferences";
import type {
  CreateNotificationPreferenceInput,
  NotificationPreference,
  UpdateNotificationPreferenceInput,
} from "@/schemas/notification-preference.schema";

export const notificationPreferenceKeys = {
  all: ["notification-preferences"] as const,
  detail: (id: string) => ["notification-preferences", id] as const,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationPreferenceKeys.all,
    queryFn: notificationPreferencesApi.getAll,
  });
}

export function useCreateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNotificationPreferenceInput) =>
      notificationPreferencesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationPreferenceKeys.all,
      });
    },
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateNotificationPreferenceInput;
    }) => notificationPreferencesApi.update(id, input),
    onSuccess: (preference: NotificationPreference) => {
      queryClient.invalidateQueries({
        queryKey: notificationPreferenceKeys.all,
      });
      queryClient.setQueryData(
        notificationPreferenceKeys.detail(preference.id),
        preference,
      );
    },
  });
}

export function useDeleteNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationPreferencesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationPreferenceKeys.all,
      });
    },
  });
}
