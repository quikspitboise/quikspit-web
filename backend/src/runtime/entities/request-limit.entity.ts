import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'request_limits' })
@Index(['expiresAt'])
export class RequestLimitEntity {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  key!: string;

  @Column({ type: 'integer' })
  hits!: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'blocked_until', type: 'timestamptz', nullable: true })
  blockedUntil!: Date | null;
}
