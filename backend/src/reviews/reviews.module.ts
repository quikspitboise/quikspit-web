import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { RuntimeModule } from '../runtime/runtime.module';

@Module({
  imports: [ConfigModule, RuntimeModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
