import { MigrationInterface, QueryRunner } from 'typeorm';
export class AdminNotificationRetry1758296600000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE reminders ADD COLUMN admin_retry_requested_at timestamptz',
    );
    await q.query('ALTER TABLE admin_audit_events ADD COLUMN resource_id uuid');
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE reminders DROP COLUMN admin_retry_requested_at');
    await q.query('ALTER TABLE admin_audit_events DROP COLUMN resource_id');
  }
}
