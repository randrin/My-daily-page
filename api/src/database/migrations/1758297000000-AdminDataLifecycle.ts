import { MigrationInterface, QueryRunner } from 'typeorm';
export class AdminDataLifecycle1758297000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE admin_exports (
      id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes',
      row_count integer NOT NULL, filters jsonb NOT NULL, content bytea
    );
    CREATE INDEX admin_exports_expiry ON admin_exports(expires_at);
    CREATE TABLE admin_retention_policy (
      id integer PRIMARY KEY CHECK(id=1), audit_days integer NOT NULL CHECK(audit_days BETWEEN 365 AND 3650),
      reminder_days integer NOT NULL CHECK(reminder_days BETWEEN 30 AND 3650),
      export_days integer NOT NULL CHECK(export_days BETWEEN 1 AND 365), version integer NOT NULL DEFAULT 1
    );
    INSERT INTO admin_retention_policy(id,audit_days,reminder_days,export_days) VALUES(1,365,90,7);
    CREATE TABLE admin_retention_holds (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), resource_type varchar(20) NOT NULL CHECK(resource_type IN ('audit','reminders','exports')),
      resource_id uuid NOT NULL, reason varchar(240) NOT NULL, actor_id uuid NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), released_at timestamptz
    );
    CREATE UNIQUE INDEX admin_active_hold ON admin_retention_holds(resource_type,resource_id) WHERE released_at IS NULL;
    CREATE TABLE admin_purge_plans (
      id uuid PRIMARY KEY, actor_id uuid NOT NULL, session_version integer NOT NULL, policy_version integer NOT NULL,
      candidates jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes', purged_at timestamptz
    );
    CREATE TABLE admin_purge_runs (
      id uuid PRIMARY KEY REFERENCES admin_purge_plans(id), actor_id uuid NOT NULL, transaction_id bigint NOT NULL DEFAULT txid_current(),
      created_at timestamptz NOT NULL DEFAULT now(), audit_deleted integer NOT NULL DEFAULT 0,
      reminders_deleted integer NOT NULL DEFAULT 0, exports_deleted integer NOT NULL DEFAULT 0
    );`);
    await q.query(`DROP TRIGGER admin_audit_append_only ON admin_audit_events;
      CREATE TRIGGER admin_audit_no_update BEFORE UPDATE OR TRUNCATE ON admin_audit_events FOR EACH STATEMENT EXECUTE FUNCTION prevent_admin_audit_mutation();
      CREATE FUNCTION guard_admin_audit_delete() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF pg_trigger_depth() < 2 OR NOT EXISTS (
          SELECT 1 FROM admin_purge_runs r JOIN admin_purge_plans p ON p.id=r.id
          JOIN admin_retention_policy policy ON policy.id=1
          WHERE r.transaction_id=txid_current() AND p.policy_version=policy.version
          AND p.expires_at>now() AND p.purged_at IS NULL
          AND p.candidates->'audit' ? OLD.id::text
          AND OLD.created_at < now()-make_interval(days=>policy.audit_days)
          AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type='audit' AND h.resource_id=OLD.id AND h.released_at IS NULL)
        ) THEN RAISE EXCEPTION 'Administrative audit deletion requires a supervised retention run'; END IF;
        RETURN OLD;
      END; $$;
      CREATE TRIGGER admin_audit_guard_delete BEFORE DELETE ON admin_audit_events FOR EACH ROW EXECUTE FUNCTION guard_admin_audit_delete();
      CREATE FUNCTION execute_admin_retention_run() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE p admin_purge_plans%ROWTYPE; policy admin_retention_policy%ROWTYPE; a integer; r integer; e integer;
      BEGIN
        SELECT * INTO p FROM admin_purge_plans WHERE id=NEW.id FOR UPDATE;
        SELECT * INTO policy FROM admin_retention_policy WHERE id=1 FOR SHARE;
        IF p.id IS NULL OR p.actor_id<>NEW.actor_id OR p.purged_at IS NOT NULL OR p.expires_at<=now() OR p.policy_version<>policy.version
          OR NOT EXISTS(SELECT 1 FROM users WHERE id=NEW.actor_id AND role='admin' AND suspended_at IS NULL AND mfa_enabled AND session_version=p.session_version)
          OR NOT EXISTS(SELECT 1 FROM admin_audit_events WHERE action='retention.purge' AND resource_id=NEW.id AND actor_id=NEW.actor_id AND created_at=now())
          THEN RAISE EXCEPTION 'Invalid supervised retention plan'; END IF;
        DELETE FROM admin_audit_events x WHERE p.candidates->'audit' ? x.id::text
          AND x.created_at < now()-make_interval(days=>policy.audit_days)
          AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type='audit' AND h.resource_id=x.id AND h.released_at IS NULL);
        GET DIAGNOSTICS a = ROW_COUNT;
        DELETE FROM reminders x USING tasks t WHERE x.task_id=t.id AND t.status IN ('DONE','ARCHIVED')
          AND p.candidates->'reminders' ? x.id::text AND x.status IN ('SENT','FAILED','CANCELLED') AND x.admin_retry_requested_at IS NULL
          AND GREATEST(x.trigger_at,COALESCE(x.sent_at,x.trigger_at)) < now()-make_interval(days=>policy.reminder_days)
          AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type='reminders' AND h.resource_id=x.id AND h.released_at IS NULL);
        GET DIAGNOSTICS r = ROW_COUNT;
        DELETE FROM admin_exports x WHERE p.candidates->'exports' ? x.id::text
          AND x.expires_at < now()-make_interval(days=>policy.export_days)
          AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type='exports' AND h.resource_id=x.id AND h.released_at IS NULL);
        GET DIAGNOSTICS e = ROW_COUNT;
        UPDATE admin_purge_runs SET audit_deleted=a,reminders_deleted=r,exports_deleted=e WHERE id=NEW.id;
        UPDATE admin_purge_plans SET purged_at=now() WHERE id=NEW.id;
        RETURN NEW;
      END; $$;
      CREATE TRIGGER admin_retention_execute AFTER INSERT ON admin_purge_runs FOR EACH ROW EXECUTE FUNCTION execute_admin_retention_run();`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TRIGGER admin_audit_guard_delete ON admin_audit_events;
      DROP TRIGGER admin_audit_no_update ON admin_audit_events;
      DROP FUNCTION guard_admin_audit_delete();
      DROP TABLE admin_purge_runs;
      DROP FUNCTION execute_admin_retention_run();
      DROP TABLE admin_purge_plans,admin_retention_holds,admin_retention_policy,admin_exports;
      CREATE TRIGGER admin_audit_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON admin_audit_events FOR EACH STATEMENT EXECUTE FUNCTION prevent_admin_audit_mutation();`);
  }
}
