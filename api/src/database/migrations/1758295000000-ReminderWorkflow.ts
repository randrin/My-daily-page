import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReminderWorkflow1758295000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TYPE "ReminderStatus" ADD VALUE IF NOT EXISTS 'SENDING'`,
    );
    await runner.query(
      `ALTER TYPE "ReminderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED'`,
    );
    await runner.query(
      `ALTER TABLE "reminders" ADD "automatic_key" varchar UNIQUE, ADD "last_error" text, ADD "attempts" integer NOT NULL DEFAULT 0`,
    );
    await runner.query(
      `ALTER TABLE "notification_preferences" ADD "whatsapp_opt_in" boolean NOT NULL DEFAULT false`,
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TABLE "reminders" DROP COLUMN "automatic_key", DROP COLUMN "last_error", DROP COLUMN "attempts"`,
    );
    await runner.query(
      `ALTER TABLE "notification_preferences" DROP COLUMN "whatsapp_opt_in"`,
    );
    // PostgreSQL enum values are retained to preserve historical statuses.
  }
}
