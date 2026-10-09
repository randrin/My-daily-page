import { z } from "zod";

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saisis une heure valide");
export const dailySettingsInputSchema = z
  .object({
    notificationsPausedUntil: z.iso
      .datetime({ offset: true })
      .nullable()
      .optional(),
    timezone: z
      .string()
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("fr-FR", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Fuseau horaire invalide")
      .optional(),
    smartQuietHoursEnabled: z.boolean().optional(),
    adaptiveEscalationEnabled: z.boolean().optional(),
    dailyDigestEnabled: z.boolean(),
    quietHoursEnabled: z.boolean(),
    quietHoursStart: time,
    quietHoursEnd: time,
    quietHoursAllowUrgent: z.boolean(),
  })
  .refine((value) => value.quietHoursStart !== value.quietHoursEnd, {
    path: ["quietHoursEnd"],
    message: "Les heures de début et de fin doivent être différentes",
  });
export const dailySettingsSchema = dailySettingsInputSchema.and(
  z.object({ timezone: z.string() }),
);
export type DailySettingsInput = z.infer<typeof dailySettingsInputSchema>;
