import type { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import type { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions';

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

  return undefined;
}

function shouldUseSsl(): boolean {
  const explicitSsl = parseBooleanEnv(process.env.DB_SSL);
  if (explicitSsl !== undefined) {
    return explicitSsl;
  }

  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

function getSslConfig(): PostgresConnectionCredentialsOptions['ssl'] {
  if (!shouldUseSsl()) {
    return false;
  }

  return {
    rejectUnauthorized:
      parseBooleanEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED) ?? false,
  };
}

function getServerlessPoolingOptions() {
  if (!process.env.VERCEL) {
    return {};
  }

  // Serverless instances must fail fast instead of stalling past the function
  // maxDuration, and must hold a tiny pool so concurrent cold starts cannot
  // exhaust the database connection limit (Neon-friendly).
  return {
    poolSize: 1,
    connectTimeoutMS: 10000,
    extra: {
      idleTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
  };
}

export function getDatabaseConnectionOptions(): PostgresDataSourceOptions {
  const url = process.env.DATABASE_URL;
  const pooling = getServerlessPoolingOptions();

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
