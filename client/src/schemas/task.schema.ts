import { z } from "zod";
import { categoryColorSchema } from "@/schemas/category.schema";

export const taskStatusSchema = z.enum([
  "todo",
  "in-process",
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

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  category: taskCategoryRefSchema.nullable().optional(),
  recurrence: z.string().nullable().optional(),
  userId: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
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

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Ce champ est requis"),
  description: z.string().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  categoryId: z.string().uuid().optional(),
  deadline: z.date().optional(),
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskPageSize = z.infer<typeof taskPageSizeSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskPage = z.infer<typeof taskPageSchema>;
export type TaskRange = z.infer<typeof taskRangeSchema>;
export type TaskFormInput = z.infer<typeof taskFormSchema>;
