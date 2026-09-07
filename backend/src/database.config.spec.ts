import { getDatabaseConnectionOptions, getSchemaSynchronization } from './database.config';

describe('database deployment policy', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { NODE_ENV: 'test', DB_HOST: 'localhost' };
  });
  afterEach(() => { process.env = originalEnv; });

  it('verifies certificates and prevents URL parameters from overriding the SSL policy', () => {
    process.env.DB_SSL = 'true';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost/test?sslmode=no-verify&sslrootcert=other.pem';
    const options = getDatabaseConnectionOptions();
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
    expect(new URL(options.url!).search).toBe('');
    process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
    expect(() => getDatabaseConnectionOptions()).toThrow('certificate verification cannot be disabled');
  });

  it('does not synchronize schemas in preview, staging, or ordinary local startup', () => {
    for (const environment of ['development', 'staging', 'preview', 'production']) {
      process.env.NODE_ENV = environment;
      expect(getSchemaSynchronization()).toBe(false);
    }
    process.env.DB_SYNCHRONIZE = 'true';
    expect(() => getSchemaSynchronization()).toThrow('disposable localhost database');
    process.env.NODE_ENV = 'development';
    process.env.DB_DISPOSABLE = 'true';
    expect(getSchemaSynchronization()).toBe(true);
    process.env.DB_HOST = 'persistent.example.test';
    expect(() => getSchemaSynchronization()).toThrow();
  });
});
