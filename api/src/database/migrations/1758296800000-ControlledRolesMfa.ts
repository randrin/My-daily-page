import { MigrationInterface, QueryRunner } from 'typeorm';
export class ControlledRolesMfa1758296800000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE users ADD COLUMN mfa_enabled boolean NOT NULL DEFAULT false',
    );
    await q.query(
      `CREATE TABLE user_mfa (user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,secret text,pending_secret text,pending_expires_at timestamptz,last_step bigint,failed_attempts integer NOT NULL DEFAULT 0,locked_until timestamptz)`,
    );
    await q.query(
      `CREATE TABLE mfa_recovery_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,code_hash varchar(64) NOT NULL UNIQUE,active boolean NOT NULL DEFAULT false,used_at timestamptz)`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE mfa_recovery_codes,user_mfa');
    await q.query('ALTER TABLE users DROP COLUMN mfa_enabled');
  }
}
