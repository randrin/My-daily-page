import { MigrationInterface, QueryRunner } from 'typeorm';
export class TaskTemplates1758295900000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE task_templates (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, name varchar(120) NOT NULL, description text NOT NULL DEFAULT '', enabled boolean NOT NULL DEFAULT true, items jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
    );
    await queryRunner.query(
      `CREATE INDEX task_templates_user_idx ON task_templates(user_id)`,
    );
    await queryRunner.query(
      `CREATE TABLE task_template_ai_usage (user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, day date NOT NULL, requests integer NOT NULL DEFAULT 0, PRIMARY KEY(user_id, day))`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE task_template_ai_usage');
    await queryRunner.query('DROP TABLE task_templates');
  }
}
