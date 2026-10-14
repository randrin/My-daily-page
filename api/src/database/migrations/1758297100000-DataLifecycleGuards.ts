import { MigrationInterface, QueryRunner } from 'typeorm';
export class DataLifecycleGuards1758297100000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE users DROP CONSTRAINT users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK(role IN ('user','support','admin'));
      CREATE OR REPLACE FUNCTION guard_admin_audit_delete() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF pg_trigger_depth() < 2 OR NOT EXISTS (
          SELECT 1 FROM admin_purge_runs r JOIN admin_purge_plans p ON p.id=r.id
          JOIN admin_retention_policy policy ON policy.id=1
          WHERE r.transaction_id=txid_current() AND p.policy_version=policy.version
          AND p.expires_at>now() AND p.purged_at IS NULL
          AND p.candidates->'audit' ? OLD.id::text
          AND OLD.created_at < now()-make_interval(days=>policy.audit_days)
          AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type='audit' AND h.resource_id=OLD.id AND h.released_at IS NULL)
        ) THEN RAISE EXCEPTION 'Administrative audit is append-only outside a supervised retention run'; END IF;
        RETURN OLD;
      END; $$;`);
  }
  async down(q: QueryRunner): Promise<void> {
    // Refuse downgrade when support accounts exist rather than silently demoting them.
    await q.query(
      "ALTER TABLE users DROP CONSTRAINT users_role_check; ALTER TABLE users ADD CONSTRAINT users_role_check CHECK(role IN ('user','admin'))",
    );
  }
}
