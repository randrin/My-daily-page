import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskImageStorage1758294500000 implements MigrationInterface {
  name = 'TaskImageStorage1758294500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "image_url" character varying(2048)`,
    );
    await queryRunner.query(
      `CREATE TABLE "stored_files" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying(512) NOT NULL,
        "bucket" character varying(128) NOT NULL,
        "content_type" character varying(128) NOT NULL,
        "size" integer NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "kind" character varying(32) NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stored_files" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_stored_files_key" UNIQUE ("key"),
        CONSTRAINT "FK_stored_files_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_stored_files_user_id" ON "stored_files" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_stored_files_user_id"`);
    await queryRunner.query(`DROP TABLE "stored_files"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "image_url"`);
  }
}
