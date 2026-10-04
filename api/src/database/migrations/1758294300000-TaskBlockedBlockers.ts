import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskBlockedBlockers1758294300000 implements MigrationInterface {
  name = 'TaskBlockedBlockers1758294300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'BLOCKED'`,
    );
    await queryRunner.query(`
      CREATE TABLE "task_blockers" (
        "task_id" uuid NOT NULL,
        "blocker_id" uuid NOT NULL,
        CONSTRAINT "PK_task_blockers" PRIMARY KEY ("task_id", "blocker_id"),
        CONSTRAINT "CHK_task_blockers_not_self" CHECK ("task_id" <> "blocker_id"),
        CONSTRAINT "FK_task_blockers_task" FOREIGN KEY ("task_id")
          REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_task_blockers_blocker" FOREIGN KEY ("blocker_id")
          REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_task_blockers_blocker" ON "task_blockers" ("blocker_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_blockers"`);
    await queryRunner.query(
      `UPDATE "tasks" SET "status" = 'TODO' WHERE "status" = 'BLOCKED'`,
    );
    await queryRunner.query(
      `CREATE TYPE "TaskStatus_old" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(`
      ALTER TABLE "tasks"
      ALTER COLUMN "status" TYPE "TaskStatus_old"
      USING "status"::text::"TaskStatus_old"
    `);
    await queryRunner.query(`DROP TYPE "TaskStatus"`);
    await queryRunner.query(
      `ALTER TYPE "TaskStatus_old" RENAME TO "TaskStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'TODO'`,
    );
  }
}
