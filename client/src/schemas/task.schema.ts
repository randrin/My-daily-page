import { z } from "zod";
import { categoryColorSchema } from "@/schemas/category.schema";

export const taskStatusSchema = z.enum([
  "todo",
  "in-process",
  "blocked",
  "done",
  "archived",
]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const taskPageSizeSchema = z.union([
  z.literal(10),
  z.literal(20),
  z.literal(50),
  z.literal(100),
]);

const taskCategoryRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: categoryColorSchema,
  userId: z.string().optional(),
});

export const taskBlockerRefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: taskStatusSchema,
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  amount: z.string().nullable().optional(),
  currency: z.enum(["EUR", "USD", "XAF"]).optional(),
  reference: z.string().max(120).nullable().optional(),
  description: z.string().nullable().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  category: taskCategoryRefSchema.nullable().optional(),
  imageUrl: z.string().max(2048).nullable().optional(),
  recurrence: z.string().nullable().optional(),
  userId: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  blockers: z.array(taskBlockerRefSchema).optional().default([]),
  blockerIds: z.array(z.string()).optional().default([]),
});

export const taskPageSchema = z.object({
  items: z.array(taskSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: taskPageSizeSchema,
});

export const taskRangeSchema = z.object({
  items: z.array(taskSchema),
  total: z.number().int().nonnegative(),
  from: z.string().nullable(),
  to: z.string().nullable(),
});

export const taskFormSchema = z
  .object({
    recurrence: z.enum(["monthly"]).nullable().optional(),
    title: z.string().trim().min(1, "Ce champ est requis"),
    amount: z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Montant invalide (2 décimales maximum)").nullable().optional(),
    currency: z.enum(["EUR", "USD", "XAF"]).optional(),
    reference: z.string().max(120, "120 caractères maximum").nullable().optional(),
    description: z.string().optional(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    categoryId: z.string().uuid().nullable().optional(),
    deadline: z.date().optional(),
    blockerIds: z.array(z.string().uuid()).optional(),
    imageUrl: z.string().max(2048).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recurrence === "monthly" && !data.deadline) {
      ctx.addIssue({ code: "custom", path: ["deadline"], message: "L’échéance est obligatoire pour une tâche mensuelle" });
    }
    if (data.status === "blocked" && !data.blockerIds?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["blockerIds"],
        message: "Sélectionne au moins une tâche qui bloque",
      });
    }
  });

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskPageSize = z.infer<typeof taskPageSizeSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskPage = z.infer<typeof taskPageSchema>;
export type TaskRange = z.infer<typeof taskRangeSchema>;
export type TaskFormInput = z.infer<typeof taskFormSchema>;

export const createTaskFormSchema = taskFormSchema.superRefine((data, ctx) => {
  if (!data.deadline) {
    ctx.addIssue({ code: "custom", path: ["deadline"], message: "L’échéance est obligatoire" });
  }
});
