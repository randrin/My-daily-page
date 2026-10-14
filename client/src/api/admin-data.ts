import { z } from "zod";
import { apiClient } from "./client";
export const exportFilterSchema = z
  .object({
    from: z.string().datetime({ message: "Choisis la date de début" }),
    to: z.string().datetime({ message: "Choisis la date de fin" }),
    role: z.enum(["user", "support", "admin"]).optional(),
    account: z.enum(["active", "suspended"]).optional(),
  })
  .superRefine((input, ctx) => {
    const days = (Date.parse(input.to) - Date.parse(input.from)) / 86400000;
    if (days <= 0 || days > 366)
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "La période doit couvrir entre 1 et 366 jours",
      });
  });
export const retentionPolicySchema = z.object({
  auditDays: z
    .number()
    .int()
    .min(365, "Minimum 365 jours")
    .max(3650, "Maximum 3650 jours"),
  reminderDays: z
    .number()
    .int()
    .min(30, "Minimum 30 jours")
    .max(3650, "Maximum 3650 jours"),
  exportDays: z
    .number()
    .int()
    .min(1, "Minimum 1 jour")
    .max(365, "Maximum 365 jours"),
});
export const retentionHoldSchema = z.object({
  resourceType: z.enum(["audit", "reminders", "exports"]),
  resourceId: z.string().uuid("Saisis un identifiant UUID valide"),
  reason: z
    .string()
    .trim()
    .min(10, "Précise le motif (10 caractères minimum)")
    .max(240, "Maximum 240 caractères"),
});
export const dataProofSchema = z.object({
  password: z.string().min(8, "Au moins 8 caractères").max(256),
  code: z.string().trim().min(6, "Le second facteur est requis").max(64),
});
export type DataProof = z.infer<typeof dataProofSchema>;
const count = z.number().int().nonnegative();
const exportSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  expiresAt: z.string(),
  rowCount: count,
  available: z.boolean(),
});
const planSchema = z.object({
  id: z.string().uuid(),
  expiresAt: z.string(),
  counts: z.object({ audit: count, reminders: count, exports: count }),
});
export type PurgePlan = z.infer<typeof planSchema>;
const retentionSchema = z.object({
  policy: retentionPolicySchema.extend({ version: count }),
  holds: z.array(
    z.object({
      id: z.string().uuid(),
      resourceType: z.enum(["audit", "reminders", "exports"]),
      resourceId: z.string().uuid(),
      reason: z.string(),
      createdAt: z.string(),
    }),
  ),
  runs: z.array(
    z.object({
      id: z.string().uuid(),
      createdAt: z.string(),
      auditDeleted: count,
      remindersDeleted: count,
      exportsDeleted: count,
    }),
  ),
});
export const adminDataApi = {
  exports: async (page: number, pageSize: number) =>
    z
      .object({
        items: z.array(exportSchema),
        total: count,
        page: count,
        pageSize: count,
      })
      .parse(
        (
          await apiClient.get("/admin/data/exports", {
            params: { page, pageSize },
          })
        ).data,
      ),
  create: async (input: z.infer<typeof exportFilterSchema> & DataProof) => {
    await apiClient.post("/admin/data/exports", input);
  },
  download: async (id: string) => {
    const response = await apiClient.post<Blob>(
      `/admin/data/exports/${id}/download`,
      undefined,
      { responseType: "blob" },
    );
    return response.data;
  },
  retention: async () =>
    retentionSchema.parse((await apiClient.get("/admin/data/retention")).data),
  policy: async (input: z.infer<typeof retentionPolicySchema> & DataProof) => {
    await apiClient.put("/admin/data/retention", input);
  },
  hold: async (input: z.infer<typeof retentionHoldSchema> & DataProof) => {
    await apiClient.post("/admin/data/holds", input);
  },
  release: async (id: string, proof: DataProof) => {
    await apiClient.post(`/admin/data/holds/${id}/release`, proof);
  },
  preview: async () =>
    planSchema.parse(
      (await apiClient.post("/admin/data/retention/preview")).data,
    ),
  purge: async (
    input: DataProof & { planId: string; confirmation: "PURGER" },
  ) => {
    await apiClient.post("/admin/data/retention/purge", input);
  },
};
