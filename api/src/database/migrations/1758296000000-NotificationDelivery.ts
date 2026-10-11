import { MigrationInterface, QueryRunner } from 'typeorm';
export class NotificationDelivery1758296000000 implements MigrationInterface {
  async up(r: QueryRunner): Promise<void> {
    await r.query(
      `ALTER TABLE reminders ADD COLUMN provider varchar, ADD COLUMN provider_message_id varchar, ADD COLUMN delivery_status varchar, ADD COLUMN delivery_error varchar`,
    );
    await r.query(
      `CREATE INDEX reminder_provider_message ON reminders(provider, provider_message_id)`,
    );
    await r.query(
      `CREATE TABLE sms_overflow_digests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, date date NOT NULL, status varchar NOT NULL DEFAULT 'pending', snapshot jsonb, provider varchar, provider_message_id varchar, delivery_status varchar, last_error text, UNIQUE(user_id,date))`,
    );
    await r.query(
      `CREATE TABLE sms_overflow_items (reminder_id uuid PRIMARY KEY REFERENCES reminders(id) ON DELETE CASCADE, digest_id uuid NOT NULL REFERENCES sms_overflow_digests(id) ON DELETE CASCADE)`,
    );
    await r.query(
      `CREATE INDEX sms_overflow_items_digest ON sms_overflow_items(digest_id)`,
    );
    await r.query(
      `CREATE TABLE notification_delivery_events (provider varchar NOT NULL, event_id varchar NOT NULL, message_id varchar NOT NULL, status varchar NOT NULL, rank integer NOT NULL, error varchar, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(provider,event_id))`,
    );
    await r.query(
      `CREATE INDEX notification_delivery_message ON notification_delivery_events(provider,message_id,rank DESC)`,
    );
  }
  async down(r: QueryRunner): Promise<void> {
    await r.query(
      'DROP TABLE notification_delivery_events, sms_overflow_items, sms_overflow_digests',
    );
    await r.query(
      'ALTER TABLE reminders DROP COLUMN provider, DROP COLUMN provider_message_id, DROP COLUMN delivery_status, DROP COLUMN delivery_error',
    );
  }
}
