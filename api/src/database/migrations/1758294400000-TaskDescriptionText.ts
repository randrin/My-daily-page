import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskDescriptionText1758294400000 implements MigrationInterface {
  name = 'TaskDescriptionText1758294400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "description" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "description" TYPE character varying`,
    );
  }
}
