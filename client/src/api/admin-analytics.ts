import { z } from "zod";
import { apiClient } from "./client";
const metric = z.object({
  current: z.number(),
  previous: z.number().nullable(),
  change: z.number().nullable(),
  percent: z.number().nullable(),
});
const analytics = z.object({
  start: z.string(),
  end: z.string(),
  previousStart: z.string(),
  previousEnd: z.string(),
  measurementStartedAt: z.string(),
  days: z.number(),
  timezone: z.string(),
  activityComparable: z.boolean(),
  activityComplete: z.boolean(),
  summary: z.object({ signups: metric, activeUsers: metric, actions: metric }),
  series: z.array(
    z.object({
      date: z.string(),
      signups: z.number(),
      activeUsers: z.number().nullable(),
      actions: z.number().nullable(),
    }),
  ),
});
export const getAdminAnalytics = async (days: number, timezone: string) =>
  analytics.parse(
    (await apiClient.get("/admin/analytics", { params: { days, timezone } }))
      .data,
  );
