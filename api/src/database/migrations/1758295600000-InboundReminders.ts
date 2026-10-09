import { MigrationInterface, QueryRunner } from 'typeorm';
export class InboundReminders1758295600000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE tasks ADD reminders_snoozed_until timestamptz',
    );
    await runner.query(
      'CREATE TABLE notification_inbound_events(provider varchar(20) NOT NULL, event_id varchar(200) NOT NULL, result text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(provider,event_id))',
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query('DROP TABLE notification_inbound_events');
    await runner.query('ALTER TABLE tasks DROP reminders_snoozed_until');
  }
}
