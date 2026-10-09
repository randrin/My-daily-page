import { MigrationInterface, QueryRunner } from 'typeorm';
export class TravelPause1758295400000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE "users" ADD "notifications_paused_until" timestamptz',
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query('ALTER TABLE "users" DROP "notifications_paused_until"');
  }
}
