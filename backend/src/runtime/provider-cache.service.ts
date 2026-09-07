import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';

export interface SharedCacheValue<T> {
  value: T | null;
  expiresAt: number;
  fresh: boolean;
}

@Injectable()
export class ProviderCacheService {
  constructor(private readonly dataSource: DataSource) {}

  async read<T>(key: string): Promise<SharedCacheValue<T> | null> {
    const rows: Array<{ value: T | null; expires_at: Date; fresh: boolean }> =
      await this.dataSource.query(
        'SELECT value, expires_at, expires_at > now() AS fresh FROM provider_cache WHERE key = $1',
        [key],
      );
    return rows[0]
      ? {
          value: rows[0].value,
          expiresAt: new Date(rows[0].expires_at).getTime(),
          fresh: rows[0].fresh,
        }
      : null;
  }

  async claim(key: string, leaseMs = 30_000): Promise<string | null> {
    const owner = randomUUID();
    const rows: Array<{ lease_owner: string }> = await this.dataSource.query(
      `INSERT INTO provider_cache (key, value, expires_at, refresh_after, lease_owner, lease_until)
       VALUES ($1, NULL, to_timestamp(0), now(), $2, now() + $3 * interval '1 millisecond')
       ON CONFLICT (key) DO UPDATE SET lease_owner = $2, lease_until = now() + $3 * interval '1 millisecond'
       WHERE provider_cache.refresh_after <= now()
         AND (provider_cache.lease_until IS NULL OR provider_cache.lease_until <= now())
       RETURNING lease_owner`,
      [key, owner, leaseMs],
    );
    return rows[0]?.lease_owner ?? null;
  }

  async complete<T>(
    key: string,
    owner: string,
    value: T,
    ttl: number,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE provider_cache SET value = $3::jsonb,
         expires_at = now() + $4 * interval '1 millisecond',
         refresh_after = now() + $4 * interval '1 millisecond',
         lease_owner = NULL, lease_until = NULL
       WHERE key = $1 AND lease_owner = $2`,
      [key, owner, JSON.stringify(value), ttl],
    );
  }

  async fail(key: string, owner: string, retryMs = 30_000): Promise<void> {
    // Keep the last successful value while backing off after provider failures.
    await this.dataSource.query(
      `UPDATE provider_cache SET refresh_after = now() + $3 * interval '1 millisecond',
         lease_owner = NULL, lease_until = NULL
       WHERE key = $1 AND lease_owner = $2`,
      [key, owner, retryMs],
    );
  }
}
