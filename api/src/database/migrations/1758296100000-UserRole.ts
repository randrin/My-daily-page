import { MigrationInterface, QueryRunner } from 'typeorm';
export class UserRole1758296100000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN role varchar(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP COLUMN role');
  }
}
