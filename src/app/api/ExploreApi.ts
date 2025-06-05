import { ApiResponse, ListQueryParams } from '@/types/common';
import { ExploreReview } from '@/types/Explore';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const ExploreApi = {
  async getReviews({
    keywords,
    cursor,
    pageSize,
  }: ListQueryParams & { keywords: string[] }) {
    const response = await fetchWithAuth(
      `/bottle-api/reviews/explore/standard?keywords=${keywords.join('&')}`,
      { requireAuth: false },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ items: ExploreReview[] }> = await response;
    return result;
  },
};
