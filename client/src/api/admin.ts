import { z } from "zod";
import { apiClient } from "@/api/client";
const count = z.number().int().nonnegative();
export const adminOverviewSchema = z.object({
  users: count,
  newUsers: count,
  notificationsEnabled: count,
  tasks: count,
  completedTasks: count,
  failedReminders: count,
});
export const adminUsersSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      email: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      role: z.enum(["user", "admin"]),
      timezone: z.string(),
      createdAt: z.string(),
      notificationsEnabled: z.boolean(),
      dailyDigestEnabled: z.boolean(),
      tasks: count,
      completedTasks: count,
    }),
  ),
  total: count,
  page: count,
  pageSize: count,
});
export const adminApi = {
  overview: async () =>
    adminOverviewSchema.parse((await apiClient.get("/admin/overview")).data),
  users: async (params: {
    page: number;
    pageSize: number;
    search: string;
    role: string;
  }) =>
    adminUsersSchema.parse(
      (
        await apiClient.get("/admin/users", {
          params: {
            ...params,
            role: params.role === "all" ? undefined : params.role,
          },
        })
      ).data,
    ),
};
