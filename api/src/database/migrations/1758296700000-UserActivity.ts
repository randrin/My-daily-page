import { MigrationInterface, QueryRunner } from 'typeorm';
export class UserActivity1758296700000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'CREATE TABLE user_activity_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind varchar(40) NOT NULL,occurred_at timestamptz NOT NULL DEFAULT now())',
    );
    await q.query(
      'CREATE INDEX user_activity_period ON user_activity_events(occurred_at,user_id)',
    );
    await q.query(
      'CREATE TABLE user_activity_measurement (id integer PRIMARY KEY CHECK(id=1),started_at timestamptz NOT NULL DEFAULT now())',
    );
    await q.query('INSERT INTO user_activity_measurement(id) VALUES(1)');
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE user_activity_events,user_activity_measurement');
  }
}
