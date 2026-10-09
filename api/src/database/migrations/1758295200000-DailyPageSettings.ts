import { MigrationInterface, QueryRunner } from 'typeorm';

export class DailyPageSettings1758295200000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`ALTER TABLE "users"
      ADD "daily_digest_enabled" boolean NOT NULL DEFAULT false,
      ADD "quiet_hours_enabled" boolean NOT NULL DEFAULT false,
      ADD "quiet_hours_start" varchar(5) NOT NULL DEFAULT '22:00',
      ADD "quiet_hours_end" varchar(5) NOT NULL DEFAULT '07:00',
      ADD "quiet_hours_allow_urgent" boolean NOT NULL DEFAULT false`);
    await runner.query(`CREATE TABLE "daily_digests" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "date" date NOT NULL, "status" varchar NOT NULL DEFAULT 'pending',
      "last_error" text, UNIQUE ("user_id", "date"))`);
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query('DROP TABLE "daily_digests"');
    await runner.query(
      `ALTER TABLE "users" DROP "daily_digest_enabled", DROP "quiet_hours_enabled", DROP "quiet_hours_start", DROP "quiet_hours_end", DROP "quiet_hours_allow_urgent"`,
    );
  }
}
