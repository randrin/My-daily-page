import { useQuery } from "@tanstack/react-query";
import { personalizationApi } from "@/api/personalization";
export const useTaskDefaults = (enabled = true) =>
  useQuery({
    queryKey: ["personalization", "defaults"],
    queryFn: personalizationApi.defaults,
    enabled,
    retry: false,
  });
