import { MigrationInterface, QueryRunner } from 'typeorm';
export class UserLocale1758297300000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      "ALTER TABLE users ADD COLUMN locale varchar(2) NOT NULL DEFAULT 'fr' CHECK(locale IN ('fr','en'))",
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE users DROP COLUMN locale');
  }
}
