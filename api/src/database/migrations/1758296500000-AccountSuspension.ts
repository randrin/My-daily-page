import { MigrationInterface, QueryRunner } from 'typeorm';
export class AccountSuspension1758296500000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE users ADD COLUMN suspended_at timestamptz, ADD COLUMN reminders_resumed_at timestamptz, ADD COLUMN suspension_reason varchar(40), ADD COLUMN session_version integer NOT NULL DEFAULT 0',
    );
    await q.query(
      'ALTER TABLE refresh_tokens ADD COLUMN session_version integer NOT NULL DEFAULT 0',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE refresh_tokens DROP COLUMN session_version');
    await q.query(
      'ALTER TABLE users DROP COLUMN suspended_at, DROP COLUMN reminders_resumed_at, DROP COLUMN suspension_reason, DROP COLUMN session_version',
    );
  }
}
