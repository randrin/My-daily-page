import { z } from "zod";
import { apiClient } from "./client";
export const mfaPasswordSchema = z.object({
  password: z.string().min(8, "Au moins 8 caractères").max(256),
});
export const mfaConfirmSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Saisis le code à 6 chiffres de ton application"),
});
export const mfaDisableSchema = mfaPasswordSchema.extend({
  code: z.string().trim().min(6, "Le code est requis").max(64),
});
const setup = z.object({
  secret: z.string(),
  uri: z.string(),
  recoveryCodes: z.array(z.string()),
});
export type MfaSetup = z.infer<typeof setup>;
export const mfaApi = {
  status: async () =>
    z
      .object({ enabled: z.boolean(), recoveryRemaining: z.number() })
      .parse((await apiClient.get("/auth/mfa")).data),
  setup: async (input: z.infer<typeof mfaPasswordSchema>) =>
    setup.parse((await apiClient.post("/auth/mfa/setup", input)).data),
  cancel: async () => {
    await apiClient.post("/auth/mfa/cancel");
  },
  confirm: async (input: z.infer<typeof mfaConfirmSchema>) => {
    await apiClient.post("/auth/mfa/confirm", input);
  },
  disable: async (input: z.infer<typeof mfaDisableSchema>) => {
    await apiClient.post("/auth/mfa/disable", input);
  },
};
