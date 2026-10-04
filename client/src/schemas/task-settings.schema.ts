import { z } from "zod";
export const taskSettingsSchema = z.object({
  defaultDeadlineDays: z.number().int().min(0).max(3650).nullable(),
});
export type TaskSettings = z.infer<typeof taskSettingsSchema>;
