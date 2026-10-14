import { z } from "zod";
import { apiClient } from "./client";
const group = z.object({
  channel: z.string(),
  provider: z.string(),
  status: z.string(),
  count: z.number(),
  accepted: z.number(),
  unitPrice: z.number().nullable(),
  estimatedCost: z.number().nullable(),
});
const failure = z.object({
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string(),
  }),
  id: z.string().uuid(),
  channel: z.string(),
  provider: z.string(),
  status: z.string(),
  deliveryStatus: z.string().nullable(),
  triggerAt: z.string(),
  attempts: z.number(),
  retryEligible: z.boolean(),
  diagnostic: z.string(),
});
const overview = z.object({
  start: z.string(),
  end: z.string(),
  days: z.number(),
  groups: z.array(group),
  currency: z.string(),
  failures: z.array(failure),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
const queues = z.array(
  z.object({
    name: z.string(),
    available: z.boolean(),
    counts: z.record(z.string(), z.number()).nullable(),
    workers: z.number().nullable(),
    oldestEnqueuedAt: z.string().nullable(),
  }),
);
export const adminNotificationsApi = {
  overview: async (params: {
    days: number;
    channel: string;
    provider: string;
    page: number;
    pageSize: number;
    failureChannel?: string;
    failureProvider?: string;
    failureStatus?: string;
    sortBy: string;
    sortDirection: "asc" | "desc";
  }) =>
    overview.parse(
      (
        await apiClient.get("/admin/notifications", {
          params: {
            ...params,
            channel: params.channel === "all" ? undefined : params.channel,
            provider: params.provider === "all" ? undefined : params.provider,
          },
        })
      ).data,
    ),
  queues: async () =>
    queues.parse((await apiClient.get("/admin/notifications/queues")).data),
  retry: async (id: string) => {
    await apiClient.post(`/admin/notifications/${id}/retry`);
  },
};
