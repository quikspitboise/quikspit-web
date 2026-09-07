import { GalleryItemEntity } from './gallery/entities/gallery-item.entity';
import { AppSettingEntity } from './settings/entities/app-setting.entity';
import { ProviderCacheEntity } from './runtime/entities/provider-cache.entity';
import { RequestLimitEntity } from './runtime/entities/request-limit.entity';
import { CreateGalleryItemsTable1740000000000 } from './migrations/1740000000000-CreateGalleryItemsTable';
import { CreateAppSettingsTable1740000001000 } from './migrations/1740000001000-CreateAppSettingsTable';
import { AddGalleryCloudinaryMetadata1740000002000 } from './migrations/1740000002000-AddGalleryCloudinaryMetadata';
import { CreateRuntimeState1788652800000 } from './migrations/1788652800000-CreateRuntimeState';

export const DATABASE_ENTITIES = [GalleryItemEntity, AppSettingEntity, ProviderCacheEntity, RequestLimitEntity];
export const DATABASE_MIGRATIONS = [
  CreateGalleryItemsTable1740000000000,
  CreateAppSettingsTable1740000001000,
  AddGalleryCloudinaryMetadata1740000002000,
  CreateRuntimeState1788652800000,
];
