import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { profileKeys } from "@/hooks/use-profile";
import { taskSettingsSchema, type TaskSettings } from "@/schemas/task-settings.schema";
import type { Profile } from "@/schemas/profile.schema";

export function useUpdateTaskSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskSettings) => {
      const { data } = await apiClient.patch("/auth/me/task-settings", taskSettingsSchema.parse(input));
      return taskSettingsSchema.parse(data);
    },
    onSuccess: (settings) => {
      client.setQueryData<Profile>(profileKeys.me, (current) => current ? { ...current, ...settings } : current);
      void client.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}
