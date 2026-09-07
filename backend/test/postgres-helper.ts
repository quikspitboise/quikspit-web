import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { DATABASE_ENTITIES, DATABASE_MIGRATIONS } from '../src/database.registry';

/** Every suite owns a new schema. Existing schemas and customer records are never reset. */
export async function createPostgresTestContext() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is required for PostgreSQL integration tests');
  const schema = `quikspit_test_${randomUUID().replaceAll('-', '')}`;
  const maintenance = new DataSource({ type: 'postgres', url, ssl: false });
  const connections: DataSource[] = [];
  await maintenance.initialize();
  await maintenance.query(`CREATE SCHEMA "${schema}"`);

  const connect = async () => {
    const connection = new DataSource({
      type: 'postgres', url, ssl: false, schema,
      entities: DATABASE_ENTITIES,
      migrations: DATABASE_MIGRATIONS,
      synchronize: false,
      extra: { options: `-c search_path=${schema}`, statement_timeout: 5000 },
    });
    connections.push(connection);
    await connection.initialize();
    return connection;
  };
  const close = async () => {
    await Promise.all(connections.filter((source) => source.isInitialized).map((source) => source.destroy()));
    await maintenance.query(`DROP SCHEMA "${schema}" CASCADE`);
    await maintenance.destroy();
  };
  try {
    const dataSource = await connect();
    await dataSource.runMigrations({ transaction: 'all' });
    return { dataSource, connect, close, schema };
  } catch (error) {
    await close();
    throw error;
  }
}
