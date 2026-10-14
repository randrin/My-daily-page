import { z } from "zod";
import { apiClient } from "./client";
export const defaultsSchema = z.object({
  priority: z.enum(["low", "medium", "high", "urgent"]),
  categoryId: z.string().uuid().nullable(),
  reminderLeadMinutes: z
    .number()
    .int()
    .min(0, "Minimum 0 minute")
    .max(10080, "Maximum 7 jours"),
  dashboardPeriod: z.enum(["7d", "1m", "2m", "3m"]),
  taskView: z.enum(["table", "grid"]),
  taskSort: z.enum(["title", "status", "priority", "deadline"]),
  sortDirection: z.enum(["asc", "desc"]),
});
export type TaskDefaults = z.infer<typeof defaultsSchema>;
export const defaultValues: TaskDefaults = {
  priority: "medium",
  categoryId: null,
  reminderLeadMinutes: 0,
  dashboardPeriod: "7d",
  taskView: "table",
  taskSort: "deadline",
  sortDirection: "asc",
};
export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  consent: z.literal(true, { error: "Ton accord explicite est requis" }),
});
const energy = z.object({
  enabled: z.boolean(),
  total: z.number(),
  days: z.number(),
  suggestions: z.array(
    z.object({ hour: z.number().int().min(0).max(23), count: z.number() }),
  ),
});
const pairs = z.array(
  z.object({
    id: z.string().uuid(),
    direction: z.enum(["incoming", "outgoing"]),
    name: z.string(),
    status: z.enum(["pending", "accepted", "declined", "revoked", "expired"]),
    enabled: z.boolean(),
    createdAt: z.string(),
    acceptedAt: z.string().nullable(),
  }),
);
export const personalizationApi = {
  defaults: async () =>
    defaultsSchema.parse(
      (await apiClient.get("/personalization/defaults")).data,
    ),
  saveDefaults: async (input: TaskDefaults) =>
    defaultsSchema.parse(
      (
        await apiClient.put(
          "/personalization/defaults",
          defaultsSchema.parse(input),
        )
      ).data,
    ),
  energy: async () =>
    energy.parse((await apiClient.get("/personalization/energy")).data),
  setEnergy: async (enabled: boolean) => {
    await apiClient.put("/personalization/energy", { enabled });
  },
  pairs: async () =>
    pairs.parse((await apiClient.get("/personalization/companions")).data),
  invite: async (input: z.infer<typeof inviteSchema>) =>
    z
      .object({
        id: z.string().uuid(),
        token: z.string().length(64),
        expiresAt: z.string(),
      })
      .parse((await apiClient.post("/personalization/companions", input)).data),
  invitation: async (token: string) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        expiresAt: z.string(),
      })
      .parse(
        (await apiClient.post("/personalization/invitation/inspect", { token }))
          .data,
      ),
  respond: async (token: string, accept: boolean) => {
    await apiClient.post(
      `/personalization/invitation/${accept ? "accept" : "decline"}`,
      accept ? { token, consent: true } : { token },
    );
  },
  togglePair: async (id: string, enabled: boolean) => {
    await apiClient.put(`/personalization/companions/${id}`, { enabled });
  },
  revoke: async (id: string) => {
    await apiClient.post(`/personalization/companions/${id}/revoke`);
  },
};
export const companionDeliverySchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    day: z.string(),
    status: z.string(),
    createdAt: z.string(),
    sentAt: z.string().nullable(),
  }),
);
export const getCompanionDeliveries = async () =>
  companionDeliverySchema.parse(
    (await apiClient.get("/personalization/deliveries")).data,
  );
