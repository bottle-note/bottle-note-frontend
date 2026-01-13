import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  ExploreListParams,
  ExploreReviewsResponse,
  ExploreAlcoholsResponse,
} from './types';

export const ExploreApi = {
  /**
   * 키워드로 리뷰를 탐색합니다.
   * @param params - 탐색 파라미터
   * @returns 리뷰 목록
   */
  async getReviews(
    params: ExploreListParams,
  ): Promise<ApiResponse<ExploreReviewsResponse>> {
    const { keywords, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      keywords,
      cursor,
      size: pageSize,
    });

    const response = await apiClient.get<ApiResponse<ExploreReviewsResponse>>(
      `/reviews/explore/standard?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.EXPLORE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 키워드로 위스키를 탐색합니다.
   * @param params - 탐색 파라미터
   * @returns 위스키 목록
   */
  async getAlcohols(
    params: ExploreListParams,
  ): Promise<ApiResponse<ExploreAlcoholsResponse>> {
    const { keywords, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      keywords,
      cursor,
      size: pageSize,
    });

    const response = await apiClient.get<ApiResponse<ExploreAlcoholsResponse>>(
      `/alcohols/explore/standard?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.EXPLORE_FETCH_FAILED);
    }

    return response;
  },
};

export type { ExploreListParams, ExploreAlcohol, ExploreReview } from './types';
