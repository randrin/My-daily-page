import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profile";
import type {
  ChangePasswordInput,
  ProfileFormInput,
} from "@/schemas/profile.schema";

export const profileKeys = {
  me: ["me"] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: profileApi.getMe,
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileFormInput) => profileApi.updateMe(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me, profile);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (
      input: Pick<ChangePasswordInput, "currentPassword" | "newPassword">,
    ) => profileApi.changePassword(input),
  });
}
