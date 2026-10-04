import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskNotes1758294600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "task_notes" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "task_id" uuid NOT NULL,
      "content" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_task_notes" PRIMARY KEY ("id"),
      CONSTRAINT "FK_task_notes_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_task_notes_task_created" ON "task_notes" ("task_id", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_notes"`);
  }
}
