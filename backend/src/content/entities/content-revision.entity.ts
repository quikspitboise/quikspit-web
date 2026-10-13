import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import type { ContentValue } from '../dto/content.dto';

@Entity({ name: 'content_revisions' })
@Index('IDX_content_revisions_document_created', ['documentKey', 'createdAt'])
export class ContentRevisionEntity {
  @PrimaryColumn({ type: 'uuid' }) id!: string;
  @Column({ type: 'varchar', length: 100 }) documentKey!: string;
  @Column({ type: 'jsonb' }) value!: ContentValue;
  @Column({ type: 'integer' }) version!: number;
  @Column({ type: 'varchar', length: 16 }) action!: 'publish' | 'unpublish';
  @Column({ type: 'varchar', length: 64, nullable: true }) createdByUserId!:
    string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
}
