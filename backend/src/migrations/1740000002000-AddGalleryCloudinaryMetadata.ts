import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGalleryCloudinaryMetadata1740000002000
  implements MigrationInterface
{
  name = 'AddGalleryCloudinaryMetadata1740000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gallery_items"
        ADD COLUMN IF NOT EXISTS "altText" character varying(255),
        ADD COLUMN IF NOT EXISTS "imageAsset" jsonb,
        ADD COLUMN IF NOT EXISTS "beforeAsset" jsonb,
        ADD COLUMN IF NOT EXISTS "afterAsset" jsonb,
        ADD COLUMN IF NOT EXISTS "isVisible" boolean DEFAULT true;
    `);

    await queryRunner.query(`
      UPDATE "gallery_items"
      SET "isVisible" = true
      WHERE "isVisible" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "gallery_items"
        ALTER COLUMN "isVisible" SET DEFAULT true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gallery_items"
        DROP COLUMN IF EXISTS "isVisible",
        DROP COLUMN IF EXISTS "afterAsset",
        DROP COLUMN IF EXISTS "beforeAsset",
        DROP COLUMN IF EXISTS "imageAsset",
        DROP COLUMN IF EXISTS "altText";
    `);
  }
}
