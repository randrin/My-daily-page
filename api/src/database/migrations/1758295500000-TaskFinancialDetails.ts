import { MigrationInterface, QueryRunner } from 'typeorm';
export class TaskFinancialDetails1758295500000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      `ALTER TABLE "tasks" ADD "amount" numeric(12,2), ADD "currency" varchar(3) NOT NULL DEFAULT 'EUR', ADD "reference" varchar(120)`,
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE "tasks" DROP "reference", DROP "currency", DROP "amount"',
    );
  }
}
