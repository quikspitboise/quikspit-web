import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGalleryItemsTable1740000000000 implements MigrationInterface {
  name = 'CreateGalleryItemsTable1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gallery_items" (
        "id"          character varying(64)   NOT NULL,
        "title"       character varying(160)  NOT NULL,
        "description" text,
        "categories"  jsonb                   DEFAULT '[]',
        "tags"        jsonb                   DEFAULT '[]',
        "assetType"   character varying(16)   NOT NULL,
        "imagePublicId"   character varying(255),
        "beforePublicId"  character varying(255),
        "afterPublicId"   character varying(255),
        "displayOrder"    integer             DEFAULT 0,
        "createdByUserId" character varying(64),
        "updatedByUserId" character varying(64),
        "createdAt"   timestamp with time zone DEFAULT now(),
        "updatedAt"   timestamp with time zone DEFAULT now(),
        CONSTRAINT "PK_gallery_items" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gallery_items_displayOrder"
        ON "gallery_items" ("displayOrder");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_gallery_items_displayOrder"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "gallery_items"`);
  }
}
