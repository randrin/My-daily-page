import { MigrationInterface, QueryRunner } from 'typeorm';
export class AdaptiveReminders1758295800000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE users ADD smart_quiet_hours_enabled boolean NOT NULL DEFAULT false, ADD adaptive_escalation_enabled boolean NOT NULL DEFAULT false',
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE users DROP smart_quiet_hours_enabled, DROP adaptive_escalation_enabled',
    );
  }
}
