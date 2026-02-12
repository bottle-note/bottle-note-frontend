import { useQuery } from '@tanstack/react-query';
import { ReviewApi } from '@/api/review/review.api';
import type { ReviewDetailsResponse } from '@/api/review/types';

export const reviewDetailKeys = {
  all: ['reviewDetail'] as const,
  detail: (reviewId: string) => [...reviewDetailKeys.all, reviewId] as const,
};

interface UseReviewDetailQueryOptions {
  reviewId: string | string[] | undefined;
}

/**
 * 리뷰 상세 정보를 조회하는 TanStack Query 훅
 */
export const useReviewDetailQuery = ({
  reviewId,
}: UseReviewDetailQueryOptions) => {
  const id = Array.isArray(reviewId) ? reviewId[0] : reviewId;

  return useQuery({
    queryKey: reviewDetailKeys.detail(id ?? ''),
    queryFn: async (): Promise<ReviewDetailsResponse> => {
      const response = await ReviewApi.getReviewDetails(id!);
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 0,
  });
};
