import { MigrationInterface, QueryRunner } from 'typeorm';
export class AssistantDrafts1758296300000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE TABLE assistant_drafts (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, source varchar(20) NOT NULL, provider varchar(20) NOT NULL, items jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), confirmed_at timestamptz, created_count integer)`,
    );
    await q.query(
      'CREATE INDEX assistant_drafts_user_created ON assistant_drafts(user_id,created_at DESC)',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE assistant_drafts');
  }
}
