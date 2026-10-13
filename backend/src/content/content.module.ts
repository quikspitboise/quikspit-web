import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import {
  ContentController,
  ContentAdminController,
} from './content.controller';
import { ContentService } from './content.service';
import { ContentDocumentEntity } from './entities/content-document.entity';
import { ContentRevisionEntity } from './entities/content-revision.entity';

@Module({
  imports: [
    // Registers these entities for AppModule's autoLoadEntities, even though
    // ContentService accesses repositories through DataSource directly.
    TypeOrmModule.forFeature([ContentDocumentEntity, ContentRevisionEntity]),
    AuthModule,
  ],
  controllers: [ContentController, ContentAdminController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
