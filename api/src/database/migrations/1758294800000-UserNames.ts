import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserNames1758294800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "first_name" varchar(100), ADD "last_name" varchar(100)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name", DROP COLUMN "first_name"`);
  }
}
