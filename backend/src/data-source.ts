import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getDatabaseConnectionOptions, getSchemaSynchronization } from './database.config';
import { DATABASE_ENTITIES, DATABASE_MIGRATIONS } from './database.registry';

config();

const requiredEnvVars = [
  ...(process.env.DATABASE_URL
    ? []
    : ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME']),
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
      'Please configure these in your .env file.',
  );
}

export const AppDataSource = new DataSource({
  ...getDatabaseConnectionOptions(),
  synchronize: getSchemaSynchronization(),
  logging: process.env.NODE_ENV === 'development',
  entities: DATABASE_ENTITIES,
  migrations: DATABASE_MIGRATIONS,
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
    }
  } catch (error) {
    console.error('Database connection failed');
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
    console.error('Error closing database connection');
    throw error;
  }
};
