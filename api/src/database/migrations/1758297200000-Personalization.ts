import { MigrationInterface, QueryRunner } from 'typeorm';
export class Personalization1758297200000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE users ADD COLUMN task_defaults jsonb NOT NULL DEFAULT '{"priority":"medium","categoryId":null,"reminderLeadMinutes":0,"dashboardPeriod":"7d","taskView":"table","taskSort":"deadline","sortDirection":"asc"}', ADD COLUMN energy_enabled boolean NOT NULL DEFAULT false;
  ALTER TABLE tasks ADD COLUMN reminder_lead_minutes integer NOT NULL DEFAULT 0 CHECK(reminder_lead_minutes BETWEEN 0 AND 10080);
  CREATE FUNCTION snapshot_reminder_default() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    NEW.reminder_lead_minutes=COALESCE((SELECT (task_defaults->>'reminderLeadMinutes')::integer FROM users WHERE id=NEW.user_id),0); RETURN NEW; END; $$;
  CREATE TRIGGER task_reminder_default BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION snapshot_reminder_default();
  CREATE TABLE task_completion_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,task_id uuid NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,completed_at timestamptz NOT NULL DEFAULT now());
  CREATE INDEX completion_user_time ON task_completion_events(user_id,completed_at);
  CREATE FUNCTION capture_task_completion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.status='DONE' AND OLD.status<>'DONE' THEN
      PERFORM 1 FROM users WHERE id=NEW.user_id AND energy_enabled AND suspended_at IS NULL FOR SHARE;
      IF FOUND THEN
      INSERT INTO task_completion_events(user_id,task_id) VALUES(NEW.user_id,NEW.id) ON CONFLICT(task_id) DO NOTHING;
    END IF; END IF; RETURN NEW; END; $$;
  CREATE TRIGGER task_completion_capture AFTER UPDATE OF status ON tasks FOR EACH ROW EXECUTE FUNCTION capture_task_completion();
  CREATE FUNCTION clear_default_category() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    UPDATE users SET task_defaults=jsonb_set(task_defaults,'{categoryId}','null') WHERE id=OLD.user_id AND task_defaults->>'categoryId'=OLD.id::text; RETURN OLD; END; $$;
  CREATE TRIGGER category_default_cleanup AFTER DELETE ON categories FOR EACH ROW EXECUTE FUNCTION clear_default_category();
  CREATE TABLE accountability_pairs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,target_email varchar(320) NOT NULL,recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,token_hash varchar(64) NOT NULL UNIQUE,status varchar(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined','revoked')),owner_enabled boolean NOT NULL DEFAULT true,recipient_enabled boolean NOT NULL DEFAULT false,expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',created_at timestamptz NOT NULL DEFAULT now(),accepted_at timestamptz,revoked_at timestamptz);
  CREATE UNIQUE INDEX accountability_owner_active ON accountability_pairs(owner_id) WHERE status IN ('pending','accepted');
  CREATE TABLE accountability_deliveries(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),pair_id uuid NOT NULL REFERENCES accountability_pairs(id) ON DELETE CASCADE,local_day date NOT NULL,status varchar(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed','cancelled','uncertain')),created_at timestamptz NOT NULL DEFAULT now(),sent_at timestamptz,provider_message_id varchar(200),UNIQUE(pair_id,local_day));`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      `DROP TABLE accountability_deliveries,accountability_pairs; DROP TRIGGER category_default_cleanup ON categories; DROP FUNCTION clear_default_category(); DROP TRIGGER task_completion_capture ON tasks; DROP FUNCTION capture_task_completion(); DROP TABLE task_completion_events; DROP TRIGGER task_reminder_default ON tasks; DROP FUNCTION snapshot_reminder_default(); ALTER TABLE tasks DROP COLUMN reminder_lead_minutes; ALTER TABLE users DROP COLUMN task_defaults,DROP COLUMN energy_enabled;`,
    );
  }
}
