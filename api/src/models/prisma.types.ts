import type { Prisma } from '@prisma/client';

/** Types Prisma dérivés du schéma — utilisables même avant `prisma generate`. */
export type PrismaUser = Prisma.UserGetPayload<Record<string, never>>;
export type PrismaCategory = Prisma.CategoryGetPayload<Record<string, never>>;
export type PrismaTask = Prisma.TaskGetPayload<Record<string, never>>;
export type PrismaReminder = Prisma.ReminderGetPayload<Record<string, never>>;
export type PrismaNotificationPreference =
  Prisma.NotificationPreferenceGetPayload<Record<string, never>>;

export type PrismaTaskWithRelations = Prisma.TaskGetPayload<{
  include: { category: true; reminders: true };
}>;
