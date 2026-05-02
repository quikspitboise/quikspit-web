import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getDatabaseConnectionOptions } from './database.config';
import { GalleryItemEntity } from './gallery/entities/gallery-item.entity';
import { AppSettingEntity } from './settings/entities/app-setting.entity';
import { CreateGalleryItemsTable1740000000000 } from './migrations/1740000000000-CreateGalleryItemsTable';
import { CreateAppSettingsTable1740000001000 } from './migrations/1740000001000-CreateAppSettingsTable';
import { AddGalleryCloudinaryMetadata1740000002000 } from './migrations/1740000002000-AddGalleryCloudinaryMetadata';

config();

const requiredEnvVars = [
  ...(process.env.DATABASE_URL
    ? []
    : ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME']),
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

const isProductionRuntime =
  process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
      'Please configure these in your .env file.',
  );
}

export const AppDataSource = new DataSource({
  ...getDatabaseConnectionOptions(),
  synchronize: !isProductionRuntime,
  logging: process.env.NODE_ENV === 'development',
  entities: [GalleryItemEntity, AppSettingEntity],
  migrations: [
    CreateGalleryItemsTable1740000000000,
    CreateAppSettingsTable1740000001000,
    AddGalleryCloudinaryMetadata1740000002000,
  ],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};
