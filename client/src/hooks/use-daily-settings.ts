import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import {
  dailySettingsInputSchema,
  dailySettingsSchema,
  type DailySettingsInput,
} from "@/schemas/daily-settings.schema";

export function useDailySettings() {
  return useQuery({
    queryKey: ["daily-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        "/notification-preferences/daily-settings",
      );
      return dailySettingsSchema.parse(data);
    },
    refetchInterval: 60_000,
  });
}
export function useUpdateDailySettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: DailySettingsInput) => {
      const { data } = await apiClient.patch(
        "/notification-preferences/daily-settings",
        dailySettingsInputSchema.parse(input),
      );
      return dailySettingsSchema.parse(data);
    },
    onSuccess: (data) => {
      client.setQueryData(["daily-settings"], data);
      void client.invalidateQueries({ queryKey: ["me"] });
      void client.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
