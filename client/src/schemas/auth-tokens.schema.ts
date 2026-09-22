import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  timezone: z.string().optional(),
});

export const authTokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.literal("Bearer").optional(),
  expires_in: z.number().int().positive(),
  user: authUserSchema,
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
