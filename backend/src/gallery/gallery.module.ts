import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryItemEntity } from './entities/gallery-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryItemEntity]), AuthModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
