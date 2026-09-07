import type { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import type { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions';
import { readFileSync } from 'node:fs';

// Static side-effect import: TypeORM loads the pg driver via dynamic require(), which Vercel's function file-tracer cannot see. Without this, pg is missing from the serverless bundle and every cold start crashes with DriverPackageNotInstalledError.
import 'pg';

function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error('Database boolean settings must be true or false');
}

function shouldUseSsl(): boolean {
  const explicitSsl = parseBooleanEnv(process.env.DB_SSL);
  if (explicitSsl !== undefined) {
    return explicitSsl;
  }

  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

function getSslConfig(): PostgresConnectionCredentialsOptions['ssl'] {
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
    throw new Error('Database certificate verification cannot be disabled; configure DB_SSL_CA or DB_SSL_CA_FILE');
  }
  if (!shouldUseSsl()) {
    return false;
  }

  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n') ||
    (process.env.DB_SSL_CA_FILE ? readFileSync(process.env.DB_SSL_CA_FILE, 'utf8') : undefined);
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

function getPoolingOptions() {
  return {
    poolSize: process.env.VERCEL ? 2 : 5,
    connectTimeoutMS: 5000,
    extra: {
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
      statement_timeout: 5000,
      idleTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
  };
}

function getDatabaseUrl(): string | undefined {
  if (!process.env.DATABASE_URL) return undefined;
  const url = new URL(process.env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol');
  }
  // pg parses these after the explicit SSL object and otherwise replaces its CA
  // and verification policy. Keep all TLS configuration in one place.
  for (const key of ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslpassword', 'uselibpqcompat']) {
    url.searchParams.delete(key);
  }
  return url.toString();
}

export function getSchemaSynchronization(): boolean {
  if (!parseBooleanEnv(process.env.DB_SYNCHRONIZE)) return false;
  const hostname = process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).hostname
    : process.env.DB_HOST;
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL ||
      process.env.DB_DISPOSABLE !== 'true' ||
      !['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname || '')) {
    throw new Error('DB_SYNCHRONIZE requires a disposable localhost database and NODE_ENV=development');
  }
  return true;
}

export function getDatabaseConnectionOptions(): PostgresDataSourceOptions {
  const url = getDatabaseUrl();
  const pooling = getPoolingOptions();

  if (url) {
    return {
      type: 'postgres',
      url,
      ssl: getSslConfig(),
      ...pooling,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: getSslConfig(),
    ...pooling,
  };
}
