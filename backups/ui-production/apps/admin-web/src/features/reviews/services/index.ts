import { reviewService as realReviewService } from './review.service';

export const reviewsService = {
  async getAll() {
    return realReviewService.listReviews();
  }
};
