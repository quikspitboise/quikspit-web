import { randomUUID } from 'node:crypto';
import type { MigrationInterface, QueryRunner } from 'typeorm';
import { INITIAL_CONTENT_V1 } from '../content/content-seed.v1';

export class CreateSiteContent1791763200000 implements MigrationInterface {
  name = 'CreateSiteContent1791763200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "content_documents" (
        "key" varchar(100) PRIMARY KEY,
        "kind" varchar(16) NOT NULL CHECK ("kind" IN ('site', 'catalog', 'page')),
        "draft" jsonb NOT NULL,
        "version" integer NOT NULL DEFAULT 1 CHECK ("version" > 0),
        "published" jsonb,
        "publishedRevisionId" uuid,
        "publishedAt" timestamptz,
        "updatedByUserId" varchar(64),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_content_publication" CHECK (
          ("published" IS NULL AND "publishedRevisionId" IS NULL AND "publishedAt" IS NULL) OR
          ("published" IS NOT NULL AND "publishedRevisionId" IS NOT NULL AND "publishedAt" IS NOT NULL)
        )
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "content_revisions" (
        "id" uuid PRIMARY KEY,
        "documentKey" varchar(100) NOT NULL REFERENCES "content_documents"("key"),
        "value" jsonb NOT NULL,
        "version" integer NOT NULL,
        "action" varchar(16) NOT NULL CHECK ("action" IN ('publish', 'unpublish')),
        "createdByUserId" varchar(64),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_content_revision_version" UNIQUE ("documentKey", "version")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_content_revisions_document_created" ON "content_revisions" ("documentKey", "createdAt")',
    );
    await queryRunner.query(
      'ALTER TABLE "content_documents" ADD CONSTRAINT "FK_content_published_revision" FOREIGN KEY ("publishedRevisionId") REFERENCES "content_revisions"("id")',
    );
    for (const document of INITIAL_CONTENT_V1) {
      const id = randomUUID();
      const value = JSON.stringify(document.value);
      await queryRunner.query(
        'INSERT INTO "content_documents" ("key", "kind", "draft") VALUES ($1, $2, $3::jsonb)',
        [document.key, document.kind, value],
      );
      await queryRunner.query(
        'INSERT INTO "content_revisions" ("id", "documentKey", "value", "version", "action") VALUES ($1, $2, $3::jsonb, 1, \'publish\')',
        [id, document.key, value],
      );
      await queryRunner.query(
        'UPDATE "content_documents" SET "published" = $2::jsonb, "publishedRevisionId" = $3, "publishedAt" = now() WHERE "key" = $1',
        [document.key, value, id],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "content_documents" DROP CONSTRAINT "FK_content_published_revision"',
    );
    await queryRunner.query('DROP TABLE "content_revisions"');
    await queryRunner.query('DROP TABLE "content_documents"');
  }
}
