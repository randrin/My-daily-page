import { MigrationInterface, QueryRunner } from 'typeorm';
export class MonthlyRecurrence1758295300000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE "tasks" ADD "previous_occurrence_id" uuid UNIQUE, ADD "recurrence_day" integer',
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE "tasks" DROP "previous_occurrence_id", DROP "recurrence_day"',
    );
  }
}
