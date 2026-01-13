import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import { transformRateList } from './transformers';
import type {
  RateListParams,
  RatePostParams,
  RateApiRaw,
  RateListResponse,
  UserRatingResponse,
} from './types';

export const RateApi = {
  /**
   * 평점 목록을 조회합니다.
   * @param params - 조회 파라미터
   * @returns 평점 목록
   */
  async getList(
    params: RateListParams,
  ): Promise<ApiResponse<RateListResponse>> {
    const {
      keyword,
      category,
      regionId,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    } = params;

    const queryString = buildQueryParams({
      keyword,
      category,
      regionId: regionId || undefined,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<
      ApiResponse<{ ratings: RateApiRaw[]; totalCount: number }>
    >(`/rating?${queryString}`, { authRequired: false });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.RATE_FETCH_FAILED);
    }

    // 데이터 변환 적용
    const transformedRatings = transformRateList(response.data.ratings);

    return {
      ...response,
      data: {
        ratings: transformedRatings,
        totalCount: response.data.totalCount,
      },
    };
  },

  /**
   * 특정 위스키에 대한 사용자의 평점을 조회합니다.
   * @param alcoholId - 위스키 ID
   * @returns 사용자 평점 정보
   */
  async getUserRating(
    alcoholId: string,
  ): Promise<ApiResponse<UserRatingResponse>> {
    const response = await apiClient.get<ApiResponse<UserRatingResponse>>(
      `/rating/${alcoholId}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.RATE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 평점을 등록합니다.
   * @param params - 평점 등록 파라미터
   * @returns 등록 결과
   */
  async postRating(params: RatePostParams): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/rating/register`,
      params,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.RATE_CREATE_FAILED);
    }

    return response;
  },
};

export type {
  RateListParams,
  RatePostParams,
  RateAlcohol,
  RateListResponse,
} from './types';
