import { z } from "zod";

export const taskNoteInputSchema = z.object({
  content: z.string().trim().min(1, "Saisis une note").max(10000, "La note ne peut pas dépasser 10 000 caractères"),
});
export const taskNoteSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  content: z.string(),
  createdAt: z.coerce.date(),
});
export type TaskNote = z.infer<typeof taskNoteSchema>;
