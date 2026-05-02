import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppSettingsTable1740000001000
  implements MigrationInterface
{
  name = 'CreateAppSettingsTable1740000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "app_settings" (
        "key"             character varying(80) NOT NULL,
        "value"           jsonb                 NOT NULL,
        "updatedByUserId" character varying(64),
        "createdAt"       timestamp with time zone DEFAULT now(),
        "updatedAt"       timestamp with time zone DEFAULT now(),
        CONSTRAINT "PK_app_settings" PRIMARY KEY ("key")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_settings"`);
  }
}
