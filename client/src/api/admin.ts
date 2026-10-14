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
      role: z.enum(["user", "support", "admin"]),
      mfaEnabled: z.boolean(),
      suspendedAt: z.string().nullable(),
      suspensionReason: z.string().nullable(),
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
    account: string;
    sortBy: string;
    sortDirection: "asc" | "desc";
  }) =>
    adminUsersSchema.parse(
      (
        await apiClient.get("/admin/users", {
          params: {
            ...params,
            role: params.role === "all" ? undefined : params.role,
            account: params.account === "all" ? undefined : params.account,
          },
        })
      ).data,
    ),
};

export const adminAuditSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      actorId: z.string().uuid(),
      targetId: z.string().uuid().nullable(),
      resourceId: z.string().uuid().nullable().optional(),
      roleBefore: z.string().nullable().optional(),
      roleAfter: z.string().nullable().optional(),
      actor: z
        .object({
          id: z.string().uuid(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string(),
        })
        .nullable(),
      target: z
        .object({
          id: z.string().uuid(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string(),
        })
        .nullable(),
      action: z.string(),
      createdAt: z.string(),
    }),
  ),
  total: z.number().int().nonnegative(),
  page: z.number().int(),
  pageSize: z.number().int(),
});
export const getAdminAudit = async (
  page: number,
  pageSize: number,
  sortBy: string = "createdAt",
  sortDirection: "asc" | "desc" = "desc",
) =>
  adminAuditSchema.parse(
    (
      await apiClient.get("/admin/audit", {
        params: { page, pageSize, sortBy, sortDirection },
      })
    ).data,
  );

export const accountStatusSchema = z
  .object({
    suspended: z.boolean(),
    reason: z.enum(["security", "abuse", "user_request", "other"]).optional(),
  })
  .refine((value) => !value.suspended || !!value.reason, {
    path: ["reason"],
    message: "Choisis un motif de suspension",
  });
export const changeAdminAccountStatus = async (
  id: string,
  input: z.infer<typeof accountStatusSchema>,
) => {
  await apiClient.patch(`/admin/users/${id}/status`, input);
};
