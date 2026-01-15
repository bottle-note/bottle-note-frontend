import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  MyBottleTabType,
  MyBottleListParams,
  RatingMyBottleListResponse,
  ReviewMyBottleListResponse,
  PickMyBottleListResponse,
} from './types';

export const MyBottleApi = {
  /**
   * 마이보틀 유형에 따른 API 함수를 반환합니다.
   * @param type - 마이보틀 탭 유형
   * @returns 해당 유형의 API 함수
   */
  getMyBottle(type: MyBottleTabType) {
    if (type === 'ratings') return MyBottleApi.getRatings;
    if (type === 'reviews') return MyBottleApi.getReviews;
    if (type === 'picks') return MyBottleApi.getPicks;

    throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
  },

  /**
   * 리뷰 마이보틀 목록을 조회합니다.
   */
  async getReviews({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<ReviewMyBottleListResponse>> {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      keyword: keyword ? decodeURI(keyword) : undefined,
      regionId: regionId || undefined,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<
      ApiResponse<ReviewMyBottleListResponse>
    >(`/my-page/${userId}/my-bottle/reviews?${queryString}`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 평점 마이보틀 목록을 조회합니다.
   */
  async getRatings({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<RatingMyBottleListResponse>> {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      keyword: keyword ? decodeURI(keyword) : undefined,
      regionId: regionId || undefined,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<
      ApiResponse<RatingMyBottleListResponse>
    >(`/my-page/${userId}/my-bottle/ratings?${queryString}`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 픽 마이보틀 목록을 조회합니다.
   */
  async getPicks({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<PickMyBottleListResponse>> {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const queryString = buildQueryParams({
      keyword: keyword ? decodeURI(keyword) : undefined,
      regionId: regionId || undefined,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<PickMyBottleListResponse>>(
      `/my-page/${userId}/my-bottle/picks?${queryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },
};

export type { MyBottleTabType, MyBottleListParams } from './types';
