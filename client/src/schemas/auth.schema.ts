import { z } from "zod";

export const requiredEmail = z
  .string()
  .trim()
  .min(1, "Ce champ est requis")
  .email("Email invalide");

export const requiredPassword = z
  .string()
  .min(1, "Ce champ est requis")
  .min(8, "Au moins 8 caractères");

export const signInSchema = z.object({
  email: requiredEmail,
  password: requiredPassword,
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: requiredPassword,
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\+?[0-9\s.-]{8,20}$/.test(value), {
        message: "Numéro invalide",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: requiredEmail,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
