import { randomUUID } from 'node:crypto';
import { PostgresThrottlerStorage } from '../src/runtime/postgres-throttler.storage';
import { ProviderCacheService } from '../src/runtime/provider-cache.service';
import { createPostgresTestContext } from './postgres-helper';

describe('shared runtime state with PostgreSQL', () => {
  let context: Awaited<ReturnType<typeof createPostgresTestContext>>;
  beforeAll(async () => {
    context = await createPostgresTestContext();
  });
  afterAll(async () => {
    await context?.close();
  });

  it('admits exactly the configured number of concurrent requests across instances', async () => {
    const first = new PostgresThrottlerStorage(context.dataSource);
    const second = new PostgresThrottlerStorage(await context.connect());
    const key = randomUUID();
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        (index % 2 ? first : second).increment(
          key,
          60_000,
          3,
          60_000,
          'default',
        ),
      ),
    );
    expect(results.filter((result) => !result.isBlocked)).toHaveLength(3);
    expect(results.filter((result) => result.isBlocked)).toHaveLength(9);
    expect(
      (await first.increment(randomUUID(), 60_000, 3, 60_000, 'default'))
        .isBlocked,
    ).toBe(false);
    await context.dataSource.query(
      "UPDATE request_limits SET expires_at = now() - interval '1 second', blocked_until = now() - interval '1 second' WHERE key = $1",
      [key],
    );
    expect(
      await second.increment(key, 60_000, 3, 60_000, 'default'),
    ).toMatchObject({ totalHits: 1, isBlocked: false });
  });

  it('shares successful reviews and backs off after a failed refresh without losing stale data', async () => {
    const first = new ProviderCacheService(context.dataSource);
    const second = new ProviderCacheService(await context.connect());
    const key = randomUUID();
    const lease = await first.claim(key);
    expect(lease).toBeTruthy();
    expect(await second.claim(key)).toBeNull();
    await first.complete(key, lease!, { rating: 4.8 }, 60_000);
    expect(await second.read(key)).toMatchObject({
      value: { rating: 4.8 },
      fresh: true,
    });
    await context.dataSource.query(
      "UPDATE provider_cache SET expires_at = now() - interval '1 second', refresh_after = now() - interval '1 second' WHERE key = $1",
      [key],
    );
    const retryLease = await second.claim(key);
    await second.fail(key, retryLease!);
    expect(await first.claim(key)).toBeNull();
    expect(await first.read(key)).toMatchObject({
      value: { rating: 4.8 },
      fresh: false,
    });
  });

  it('recovers an abandoned lease and rejects writes by the expired owner', async () => {
    const first = new ProviderCacheService(context.dataSource);
    const second = new ProviderCacheService(await context.connect());
    const key = randomUUID();
    const abandoned = await first.claim(key);
    await context.dataSource.query(
      "UPDATE provider_cache SET lease_until = now() - interval '1 second' WHERE key = $1",
      [key],
    );
    const replacement = await second.claim(key);
    expect(replacement).toBeTruthy();
    expect(replacement).not.toBe(abandoned);
    await first.complete(key, abandoned!, { stale: true }, 60_000);
    expect((await second.read(key))?.value).toBeNull();
    await second.complete(key, replacement!, { current: true }, 60_000);
    const restarted = new ProviderCacheService(await context.connect());
    expect((await restarted.read(key))?.value).toEqual({ current: true });
  });

  it('can roll back and replay every registered migration in an isolated schema', async () => {
    const isolated = await createPostgresTestContext();
    try {
      const migrations = await isolated.dataSource.query(
        `SELECT * FROM "${isolated.schema}".migrations`,
      );
      for (
        let remainingMigrations = migrations.length;
        remainingMigrations > 0;
        remainingMigrations -= 1
      )
        await isolated.dataSource.undoLastMigration();
      await isolated.dataSource.runMigrations({ transaction: 'all' });
      expect(
        (
          await isolated.dataSource.query(
            `SELECT * FROM "${isolated.schema}".migrations`,
          )
        ).length,
      ).toBe(migrations.length);
    } finally {
      await isolated.close();
    }
  });
});
