import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

@Injectable()
export class PostgresThrottlerStorage implements ThrottlerStorage {
  private nextCleanupAt = 0;

  constructor(private readonly dataSource: DataSource) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<Awaited<ReturnType<ThrottlerStorage['increment']>>> {
    void _throttlerName;

    // The row update serializes requests across all API instances. A blocked
    // request cannot extend the block indefinitely, and expiry starts a new window.
    const rows: Array<{
      hits: number;
      time_to_expire: number;
      time_to_block_expire: number;
      blocked: boolean;
    }> = await this.dataSource.query(
      `INSERT INTO request_limits (key, hits, expires_at, blocked_until)
       VALUES ($1, 1, now() + $2 * interval '1 millisecond', NULL)
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE
           WHEN request_limits.blocked_until > now() THEN request_limits.hits
           WHEN request_limits.expires_at <= now() OR request_limits.blocked_until IS NOT NULL THEN 1
           ELSE request_limits.hits + 1 END,
         expires_at = CASE
           WHEN request_limits.blocked_until > now() THEN request_limits.expires_at
           WHEN request_limits.expires_at <= now() OR request_limits.blocked_until IS NOT NULL
             THEN now() + $2 * interval '1 millisecond'
           ELSE request_limits.expires_at END,
         blocked_until = CASE
           WHEN request_limits.blocked_until > now() THEN request_limits.blocked_until
           WHEN request_limits.expires_at <= now() OR request_limits.blocked_until IS NOT NULL THEN NULL
           WHEN request_limits.hits + 1 > $3 THEN now() + $4 * interval '1 millisecond'
           ELSE NULL END
       RETURNING hits,
         GREATEST(0, CEIL(EXTRACT(EPOCH FROM (expires_at - now()))))::int AS time_to_expire,
         GREATEST(0, CEIL(EXTRACT(EPOCH FROM (blocked_until - now()))))::int AS time_to_block_expire,
         COALESCE(blocked_until > now(), false) AS blocked`,
      [key, ttl, limit, blockDuration],
    );

    if (Date.now() >= this.nextCleanupAt) {
      this.nextCleanupAt = Date.now() + 60_000;
      // Bound cleanup work even after a long idle period. It never changes a
      // live counter and its failure must not turn an allowed request into a 500.
      await this.dataSource
        .query(
          `DELETE FROM request_limits WHERE key IN (
           SELECT key FROM request_limits
           WHERE expires_at < now() - interval '1 hour'
             AND (blocked_until IS NULL OR blocked_until < now())
           LIMIT 1000
         )`,
        )
        .catch(() => {
          this.nextCleanupAt = Date.now() + 10_000;
        });
    }

    const row = rows[0];
    return {
      totalHits: row.hits,
      timeToExpire: row.time_to_expire,
      isBlocked: row.blocked,
      timeToBlockExpire: row.time_to_block_expire,
    };
  }
}
