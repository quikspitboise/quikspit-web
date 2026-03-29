export type GalleryAssetType = 'single' | 'comparison';

export type GalleryItem = {
  id: string;
  title: string;
  description?: string;
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
  updatedAt: string;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
};
