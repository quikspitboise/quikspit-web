export type GalleryAssetType = 'single' | 'comparison';

export type GalleryItem = {
  id: string;
  title: string;
  description?: string;
  altText?: string;
  categories?: string[];
  tags?: string[];
  beforeUrl?: string;
  afterUrl?: string;
  imageUrl?: string;
  createdAt?: string;
};

export type GalleryAdminItem = GalleryItem & {
  categories: string[];
  tags: string[];
  assetType: GalleryAssetType;
  displayOrder: number;
  isVisible: boolean;
  imagePublicId?: string | null;
  beforePublicId?: string | null;
  afterPublicId?: string | null;
  updatedAt: string;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
};
