import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GalleryAssetType {
  SINGLE = 'single',
  COMPARISON = 'comparison',
}

export type GalleryCloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalFilename?: string | null;
};

@Entity({ name: 'gallery_items' })
@Index(['displayOrder'])
export class GalleryItemEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  categories!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  tags!: string[];

  @Column({ type: 'varchar', length: 16 })
  assetType!: GalleryAssetType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagePublicId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  beforePublicId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  afterPublicId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  imageAsset!: GalleryCloudinaryAsset | null;

  @Column({ type: 'jsonb', nullable: true })
  beforeAsset!: GalleryCloudinaryAsset | null;

  @Column({ type: 'jsonb', nullable: true })
  afterAsset!: GalleryCloudinaryAsset | null;

  @Column({ type: 'boolean', default: true })
  isVisible!: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  createdByUserId!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  updatedByUserId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
