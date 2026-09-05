import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  ExploreListParams,
  ExploreReviewsParams,
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
    params: ExploreReviewsParams,
  ): Promise<ApiResponse<ExploreReviewsResponse>> {
    const {
      keyword,
      sortType,
      sortOrder,
      ratingFrom,
      ratingTo,
      cursor,
      size,
      signal,
    } = params;

    const queryString = buildQueryParams({
      keyword,
      sortType,
      sortOrder,
      ratingFrom,
      ratingTo,
      cursor,
      size,
    });

    const response = await apiClient.get<ApiResponse<ExploreReviewsResponse>>(
      `/reviews/explore/standard?${queryString}`,
      { authRequired: false, signal },
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
    const {
      keyword,
      regionIds,
      category,
      sortType,
      sortOrder,
      ratingFrom,
      ratingTo,
      cursor,
      size,
      signal,
    } = params;

    const queryString = buildQueryParams({
      keyword,
      regionIds,
      category,
      sortType,
      sortOrder,
      ratingFrom,
      ratingTo,
      cursor,
      size,
    });

    const response = await apiClient.get<ApiResponse<ExploreAlcoholsResponse>>(
      `/alcohols/explore/standard?${queryString}`,
      { authRequired: false, signal },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.EXPLORE_FETCH_FAILED);
    }

    return response;
  },
};

export type {
  ExploreListParams,
  ExploreReviewsParams,
  ExploreAlcohol,
  ExploreReview,
} from './types';
