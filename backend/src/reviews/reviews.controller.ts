import { Controller, Get } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { LoggerService } from '../common/logger.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async getReviews() {
    const data = await this.reviewsService.getReviews();

    if (!data) {
      return { available: false };
    }

    return {
      available: true,
      rating: data.rating,
      totalReviews: data.totalReviews,
      reviews: data.reviews,
      reviewLink: data.reviewLink,
    };
  }
}
