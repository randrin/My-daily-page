import { MigrationInterface, QueryRunner } from 'typeorm';
export class AuditRoleChanges1758296900000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE admin_audit_events ADD COLUMN role_before varchar(10),ADD COLUMN role_after varchar(10)',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE admin_audit_events DROP COLUMN role_before,DROP COLUMN role_after',
    );
  }
}
