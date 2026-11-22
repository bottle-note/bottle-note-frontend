import { useQuery } from '@tanstack/react-query';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreReview } from '@/api/explore/types';

// 넓은 화면에서 2열로 놓일 때 마지막 줄이 비지 않도록 짝수로 받는다.
const HOME_REVIEW_SIZE = 4;

export const homeReviewsKeys = {
  all: ['homeReviews'] as const,
};

/** 홈 리뷰: 둘러보기 리뷰 API의 최신순 첫 3개 */
export const useHomeReviewsQuery = () =>
  useQuery({
    queryKey: homeReviewsKeys.all,
    queryFn: async (): Promise<ExploreReview[]> => {
      const response = await ExploreApi.getReviews({
        sortType: 'LATEST',
        sortOrder: 'DESC',
        size: HOME_REVIEW_SIZE,
      });
      return response.data.items;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
