import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserNotificationsEnabled1758295100000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TABLE "users" ADD "notifications_enabled" boolean NOT NULL DEFAULT false`,
    );
    // Preserve the choice of existing users who already enabled a channel.
    await runner.query(
      `UPDATE "users" u SET "notifications_enabled" = true WHERE EXISTS (SELECT 1 FROM "notification_preferences" p WHERE p."user_id" = u."id" AND p."enabled" = true)`,
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TABLE "users" DROP COLUMN "notifications_enabled"`,
    );
  }
}
