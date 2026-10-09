import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/api/client";

export const templateItemSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(255),
  dayOffset: z.number().int().min(0).max(3650),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide"),
  enabled: z.boolean(),
});
export const templateInputSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(120),
  description: z.string().max(2000),
  enabled: z.boolean(),
  items: z
    .array(templateItemSchema)
    .min(1, "Ajoute au moins une tâche")
    .max(20),
});
export const templateSchema = templateInputSchema.extend({ id: z.uuid() });
export type TemplateItem = z.infer<typeof templateItemSchema>;
export type TemplateInput = z.infer<typeof templateInputSchema>;
export type TaskTemplate = z.infer<typeof templateSchema>;
export function useTaskTemplates() {
  return useQuery({
    queryKey: ["task-templates"],
    queryFn: async () => {
      const { data } = await apiClient.get("/task-templates");
      return z.array(templateSchema).parse(data);
    },
  });
}
export function useSaveTaskTemplate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: string;
      input: TemplateInput;
    }) => {
      const payload = templateInputSchema.parse(input);
      const { data } = id
        ? await apiClient.patch(`/task-templates/${id}`, payload)
        : await apiClient.post("/task-templates", payload);
      return templateSchema.parse(data);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["task-templates"] });
    },
  });
}
export function useDeleteTaskTemplate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/task-templates/${id}`);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["task-templates"] });
    },
  });
}
export function useTemplateSuggestionConfig() {
  return useQuery({
    queryKey: ["task-template-config"],
    queryFn: async () => {
      const { data } = await apiClient.get("/task-templates/config");
      return z.object({ aiEnabled: z.boolean() }).parse(data);
    },
  });
}
export async function suggestTemplate(
  name: string,
  description: string,
  mode: "guided" | "ai" = "guided",
) {
  const { data } = await apiClient.post("/task-templates/suggestions", {
    name,
    description,
    mode,
  });
  return z
    .object({
      source: z.enum(["guided", "openai"]),
      items: z.array(templateItemSchema).min(1).max(20),
    })
    .parse(data);
}
