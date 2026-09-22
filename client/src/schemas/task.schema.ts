import { z } from "zod";

export const taskStatusSchema = z.enum([
  "todo",
  "in-process",
  "done",
  "complete",
]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const taskCategorySchema = z.enum([
  "work",
  "personal",
  "shopping",
  "health",
  "finance",
  "education",
  "other",
]);

export const taskFormSchema = z
  .object({
    title: z.string().trim().min(1, "Ce champ est requis"),
    description: z.string().optional(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    category: taskCategorySchema,
    dueDate: z.date().optional(),
    toDoBefore: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.toDoBefore || !data.dueDate || data.toDoBefore <= data.dueDate,
    {
      message: "La date « à faire avant » doit précéder l'échéance",
      path: ["toDoBefore"],
    },
  );

export type TaskFormInput = z.infer<typeof taskFormSchema>;
