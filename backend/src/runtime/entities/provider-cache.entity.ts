import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'provider_cache' })
export class ProviderCacheEntity {
  @PrimaryColumn({ type: 'varchar', length: 160 })
  key!: string;

  @Column({ type: 'jsonb', nullable: true })
  value!: unknown | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'refresh_after', type: 'timestamptz' })
  refreshAfter!: Date;

  @Column({ name: 'lease_owner', type: 'uuid', nullable: true })
  leaseOwner!: string | null;

  @Column({ name: 'lease_until', type: 'timestamptz', nullable: true })
  leaseUntil!: Date | null;
}
