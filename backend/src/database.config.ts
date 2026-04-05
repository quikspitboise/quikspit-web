import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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

function getSslConfig(): PostgresConnectionOptions['ssl'] {
  if (!shouldUseSsl()) {
    return false;
  }

  return {
    rejectUnauthorized:
      parseBooleanEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED) ?? false,
  };
}

export function getDatabaseConnectionOptions(): Pick<
  PostgresConnectionOptions,
  | 'type'
  | 'url'
  | 'host'
  | 'port'
  | 'username'
  | 'password'
  | 'database'
  | 'ssl'
> {
  const url = process.env.DATABASE_URL;

  if (url) {
    return {
      type: 'postgres',
      url,
      ssl: getSslConfig(),
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
  };
}
