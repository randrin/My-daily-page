import { z } from "zod";

export const categoryColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide");

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: categoryColorSchema,
  userId: z.string().min(1),
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ce champ est requis")
    .max(80, "80 caractères maximum"),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
