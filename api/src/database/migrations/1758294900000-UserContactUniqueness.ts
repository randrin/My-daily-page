import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserContactUniqueness1758294900000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX "users_email_normalized_unique" ON "users" (lower(trim("email")))`);
    for (const field of ['phone', 'whatsapp']) {
      await queryRunner.query(`CREATE UNIQUE INDEX "users_${field}_normalized_unique" ON "users" (NULLIF(regexp_replace(regexp_replace("${field}_number", '[^0-9]', '', 'g'), '^00', ''), ''))`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const field of ['email', 'phone', 'whatsapp']) {
      await queryRunner.query(`DROP INDEX "users_${field}_normalized_unique"`);
    }
  }
}
