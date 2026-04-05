#!/usr/bin/env node
/**
 * Seed Production Database
 *
 * Exports gallery_items from local PostgreSQL and imports them into
 * the production Neon database. Safe to run multiple times (uses
 * ON CONFLICT DO UPDATE).
 *
 * Usage:
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/seed-production.ts
 *
 * Required env vars (reads from backend/.env for local, prompt for production):
 *   SOURCE_ - local DB connection (defaults to your .env values)
 *   TARGET_ - production Neon DB connection (set these or pass them inline)
 *
 * Example:
 *   TARGET_HOST=ep-xxx.neon.tech \
 *   TARGET_PORT=5432 \
 *   TARGET_USERNAME=neondb_owner \
 *   TARGET_PASSWORD=xxx \
 *   TARGET_DATABASE=neondb \
 *   npx ts-node -r tsconfig-paths/register scripts/seed-production.ts
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { GalleryItemEntity } from '../src/gallery/entities/gallery-item.entity';

config();

const sourceDB = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'quickspit_shine',
  entities: [GalleryItemEntity],
});

async function main() {
  const targetHost = process.env.TARGET_HOST;
  const targetPort = process.env.TARGET_PORT || '5432';
  const targetUsername = process.env.TARGET_USERNAME;
  const targetPassword = process.env.TARGET_PASSWORD;
  const targetDatabase = process.env.TARGET_DATABASE;

  if (!targetHost || !targetUsername || !targetPassword || !targetDatabase) {
    console.error(
      'Missing TARGET_ env vars. Set TARGET_HOST, TARGET_USERNAME, TARGET_PASSWORD, TARGET_DATABASE.',
    );
    process.exit(1);
  }

  console.log('Connecting to local database...');
  await sourceDB.initialize();
  const sourceRepo = sourceDB.getRepository(GalleryItemEntity);
  const items = await sourceRepo.find({ order: { displayOrder: 'ASC' } });
  console.log(`Found ${items.length} gallery items locally.`);

  if (items.length === 0) {
    console.log('Nothing to migrate.');
    await sourceDB.destroy();
    return;
  }

  console.log('Connecting to production database...');
  const targetDB = new DataSource({
    type: 'postgres',
    host: targetHost,
    port: parseInt(targetPort, 10),
    username: targetUsername,
    password: targetPassword,
    database: targetDatabase,
    entities: [GalleryItemEntity],
    ssl: { rejectUnauthorized: false },
  });
  await targetDB.initialize();

  const targetRepo = targetDB.getRepository(GalleryItemEntity);

  console.log('Upserting gallery items...');
  for (const item of items) {
    await targetRepo
      .createQueryBuilder()
      .insert()
      .into('gallery_items')
      .values({
        id: item.id,
        title: item.title,
        description: item.description,
        categories: JSON.stringify(item.categories),
        tags: JSON.stringify(item.tags),
        assetType: item.assetType,
        imagePublicId: item.imagePublicId,
        beforePublicId: item.beforePublicId,
        afterPublicId: item.afterPublicId,
        displayOrder: item.displayOrder,
        createdByUserId: item.createdByUserId,
        updatedByUserId: item.updatedByUserId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
      .orUpdate(
        [
          'title',
          'description',
          'categories',
          'tags',
          'assetType',
          'imagePublicId',
          'beforePublicId',
          'afterPublicId',
          'displayOrder',
          'createdByUserId',
          'updatedByUserId',
          'updatedAt',
        ],
        ['id'],
      )
      .execute();
    console.log(`  Upserted: ${item.title} (${item.id})`);
  }

  await targetDB.destroy();
  await sourceDB.destroy();
  console.log(`Done. Migrated ${items.length} gallery items.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
