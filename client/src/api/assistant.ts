import { z } from "zod";
import { apiClient } from "./client";
export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const itemSchema = z.object({
  title: z.string(),
  deadline: z.string().nullable(),
  priority: prioritySchema,
  reason: z.string(),
  selected: z.boolean(),
  deferred: z.boolean(),
});
const draftSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  provider: z.string(),
  items: z.array(itemSchema),
});
export type AssistantDraft = z.infer<typeof draftSchema>;
export const suggestionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Décris ta tâche ou colle un message")
    .max(4000, "4000 caractères maximum"),
  mode: z.enum(["capture", "breakdown"]),
  source: z.enum(["manual", "email", "whatsapp", "voice"]),
  provider: z.enum(["guided", "ai"]),
});
export const confirmationSchema = z.object({
  selectedIndices: z.array(z.number().int().min(0).max(7)).optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Le titre est requis").max(255),
        priority: prioritySchema,
        deadline: z
          .string()
          .datetime({ offset: true })
          .refine(
            (value) => Date.parse(value) > Date.now(),
            "Choisis une échéance future",
          ),
      }),
    )
    .min(1, "Sélectionne au moins une tâche")
    .max(8),
});
const briefSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  reminderHint: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      order: z.number(),
      reason: z.string(),
    }),
  ),
});
const reviewSchema = z.object({
  date: z.string(),
  completed: z.number(),
  overdue: z.number(),
  blocked: z.number(),
  truncated: z.boolean(),
  items: z.array(
    z.object({ id: z.string(), title: z.string(), reason: z.string() }),
  ),
});
export const assistantApi = {
  drafts: async () =>
    z.array(draftSchema).parse((await apiClient.get("/assistant/drafts")).data),
  suggest: async (input: z.infer<typeof suggestionSchema>) =>
    draftSchema.parse((await apiClient.post("/assistant/suggest", input)).data),
  confirm: async ({
    id,
    input,
  }: {
    id: string;
    input: z.infer<typeof confirmationSchema>;
  }) =>
    z
      .object({ created: z.number(), replayed: z.boolean() })
      .parse(
        (await apiClient.post(`/assistant/drafts/${id}/confirm`, input)).data,
      ),
  brief: async () =>
    briefSchema.parse((await apiClient.get("/assistant/brief")).data),
  review: async () =>
    reviewSchema.parse((await apiClient.get("/assistant/review")).data),
};
