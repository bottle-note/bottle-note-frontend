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

const toMyBottleQueryString = (params: MyBottleListParams) => {
  const { keyword, regionId, sortType, sortOrder, cursor, size } = params;

  return buildQueryParams({
    keyword: keyword ? decodeURI(keyword) : undefined,
    regionId: regionId || undefined,
    sortType,
    sortOrder,
    cursor,
    size,
  });
};

export const MyBottleApi = {
  getMyBottle(type: MyBottleTabType) {
    if (type === 'ratings') return MyBottleApi.getRatings;
    if (type === 'reviews') return MyBottleApi.getReviews;
    if (type === 'picks') return MyBottleApi.getPicks;

    throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
  },

  async getReviews({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<ReviewMyBottleListResponse>> {
    const response = await apiClient.get<
      ApiResponse<ReviewMyBottleListResponse>
    >(`/my-page/${userId}/my-bottle/reviews?${toMyBottleQueryString(params)}`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },

  async getRatings({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<RatingMyBottleListResponse>> {
    const response = await apiClient.get<
      ApiResponse<RatingMyBottleListResponse>
    >(`/my-page/${userId}/my-bottle/ratings?${toMyBottleQueryString(params)}`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },

  async getPicks({
    params,
    userId,
  }: {
    params: MyBottleListParams;
    userId: number;
  }): Promise<ApiResponse<PickMyBottleListResponse>> {
    const response = await apiClient.get<ApiResponse<PickMyBottleListResponse>>(
      `/my-page/${userId}/my-bottle/picks?${toMyBottleQueryString(params)}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.MY_BOTTLE_FETCH_FAILED);
    }

    return response;
  },
};

export type { MyBottleTabType, MyBottleListParams } from './types';
