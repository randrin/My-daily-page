import { MigrationInterface, QueryRunner } from 'typeorm';
export class WebPush1758295700000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TYPE "NotifChannel" ADD VALUE IF NOT EXISTS 'PUSH'`,
    );
    await runner.query(
      'CREATE TABLE push_subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, endpoint text NOT NULL UNIQUE, p256dh varchar(128) NOT NULL, auth varchar(32) NOT NULL, created_at timestamptz NOT NULL DEFAULT now())',
    );
    await runner.query(
      'CREATE INDEX push_subscriptions_user_idx ON push_subscriptions(user_id)',
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query('DROP TABLE push_subscriptions');
    // PostgreSQL enum values cannot be dropped safely while other rows may reference them.
  }
}
