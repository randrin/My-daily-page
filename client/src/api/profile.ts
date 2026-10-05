import { z } from "zod";
import { apiClient } from "@/api/client";
import {
  profileSchema,
  type ChangePasswordInput,
  type Profile,
  type ProfileFormInput,
} from "@/schemas/profile.schema";

const changePasswordResponseSchema = z.object({
  updated: z.literal(true),
});

export const profileApi = {
  getMe: async (): Promise<Profile> => {
    const { data } = await apiClient.get("/auth/me");
    return profileSchema.parse(data);
  },

  updateMe: async (input: ProfileFormInput): Promise<Profile> => {
    const { data } = await apiClient.patch("/auth/me", {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      whatsappNumber: input.whatsappNumber || null,
      timezone: input.timezone,
    });
    return profileSchema.parse(data);
  },

  changePassword: async (
    input: Pick<ChangePasswordInput, "currentPassword" | "newPassword">,
  ): Promise<void> => {
    const { data } = await apiClient.post("/auth/change-password", {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
    changePasswordResponseSchema.parse(data);
  },
};
