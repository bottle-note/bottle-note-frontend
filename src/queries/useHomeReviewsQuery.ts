import { useQuery } from '@tanstack/react-query';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreReview } from '@/api/explore/types';

const HOME_REVIEW_SIZE = 3;

export const homeReviewsKeys = {
  all: ['homeReviews'] as const,
};

/** 홈 인기 리뷰: 둘러보기 리뷰 API의 인기순 첫 3개 */
export const useHomeReviewsQuery = () =>
  useQuery({
    queryKey: homeReviewsKeys.all,
    queryFn: async (): Promise<ExploreReview[]> => {
      const response = await ExploreApi.getReviews({
        sortType: 'POPULAR',
        sortOrder: 'DESC',
        size: HOME_REVIEW_SIZE,
      });
      return response.data.items;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
