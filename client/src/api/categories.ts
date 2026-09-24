import { z } from "zod";
import { apiClient } from "@/api/client";
import {
  categorySchema,
  type Category,
  type CategoryFormInput,
} from "@/schemas/category.schema";

const categoriesSchema = z.array(categorySchema);

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get("/categories");
    return categoriesSchema.parse(data);
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get(`/categories/${id}`);
    return categorySchema.parse(data);
  },

  create: async (input: CategoryFormInput): Promise<Category> => {
    const { data } = await apiClient.post("/categories", input);
    return categorySchema.parse(data);
  },

  update: async (id: string, input: CategoryFormInput): Promise<Category> => {
    const { data } = await apiClient.patch(`/categories/${id}`, input);
    return categorySchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
