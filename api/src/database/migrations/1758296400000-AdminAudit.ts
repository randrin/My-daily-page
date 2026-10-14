import { MigrationInterface, QueryRunner } from 'typeorm';
export class AdminAudit1758296400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE admin_audit_events (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), actor_id uuid NOT NULL,
      target_id uuid, action varchar(80) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      'CREATE INDEX admin_audit_created ON admin_audit_events(created_at DESC, id DESC)',
    );
    await queryRunner.query(
      `CREATE FUNCTION prevent_admin_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Administrative audit is append-only'; END; $$`,
    );
    await queryRunner.query(
      'CREATE TRIGGER admin_audit_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON admin_audit_events FOR EACH STATEMENT EXECUTE FUNCTION prevent_admin_audit_mutation()',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE admin_audit_events');
    await queryRunner.query('DROP FUNCTION prevent_admin_audit_mutation()');
  }
}
