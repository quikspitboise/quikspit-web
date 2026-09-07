import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLimitEntity } from './entities/request-limit.entity';
import { ProviderCacheEntity } from './entities/provider-cache.entity';
import { PostgresThrottlerStorage } from './postgres-throttler.storage';
import { ProviderCacheService } from './provider-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLimitEntity, ProviderCacheEntity])],
  providers: [PostgresThrottlerStorage, ProviderCacheService],
  exports: [PostgresThrottlerStorage, ProviderCacheService],
})
export class RuntimeModule {}
