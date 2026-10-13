import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { ContentKind, ContentValue } from '../dto/content.dto';

@Entity({ name: 'content_documents' })
export class ContentDocumentEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 }) key!: string;
  @Column({ type: 'varchar', length: 16 }) kind!: ContentKind;
  @Column({ type: 'jsonb' }) draft!: ContentValue;
  @Column({ type: 'integer', default: 1 }) version!: number;
  @Column({ type: 'jsonb', nullable: true }) published!: ContentValue | null;
  @Column({ type: 'uuid', nullable: true }) publishedRevisionId!: string | null;
  @Column({ type: 'timestamptz', nullable: true }) publishedAt!: Date | null;
  @Column({ type: 'varchar', length: 64, nullable: true }) updatedByUserId!:
    string | null;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt!: Date;
}
