import { MigrationInterface, QueryRunner } from 'typeorm';
export class PasswordReset1758296200000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE TABLE password_resets (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash varchar(64) NOT NULL UNIQUE, expires_at timestamptz NOT NULL, used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      'CREATE INDEX password_resets_user_created ON password_resets (user_id, created_at DESC)',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE password_resets');
  }
}
