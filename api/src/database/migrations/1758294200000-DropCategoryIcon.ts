import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCategoryIcon1758294200000 implements MigrationInterface {
  name = 'DropCategoryIcon1758294200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN IF EXISTS "icon"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN "icon" character varying`,
    );
  }
}
