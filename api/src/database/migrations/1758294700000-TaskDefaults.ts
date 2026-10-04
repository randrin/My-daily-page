import { MigrationInterface, QueryRunner } from 'typeorm';
export class TaskDefaults1758294700000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "default_deadline_days" integer NULL CHECK ("default_deadline_days" BETWEEN 0 AND 3650)`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "default_deadline_days"`);
  }
}
