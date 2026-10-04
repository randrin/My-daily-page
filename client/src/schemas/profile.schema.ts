import { z } from "zod";
import { authUserSchema } from "@/schemas/auth-tokens.schema";
import { requiredEmail, requiredPassword } from "@/schemas/auth.schema";

export const PROFILE_TIMEZONES = [
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/London",
  "Africa/Douala",
  "Africa/Abidjan",
  "Africa/Kinshasa",
  "Africa/Lagos",
  "America/New_York",
  "America/Toronto",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "UTC",
] as const;

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^\+?[0-9\s.-]{8,20}$/.test(value), {
    message: "Numéro invalide",
  });

export const profileSchema = authUserSchema.extend({
  defaultDeadlineDays: z.number().int().min(0).max(3650).nullable().optional(),
  timezone: z.string().min(1).default("Europe/Paris"),
  createdAt: z.string().optional(),
});

export const profileFormSchema = z.object({
  email: requiredEmail,
  phoneNumber: optionalPhone,
  whatsappNumber: optionalPhone,
  timezone: z.string().trim().min(1, "Ce champ est requis"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: requiredPassword,
    newPassword: requiredPassword,
    confirmPassword: requiredPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent",
    path: ["newPassword"],
  });

export type Profile = z.infer<typeof profileSchema>;
export type ProfileFormInput = z.infer<typeof profileFormSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
