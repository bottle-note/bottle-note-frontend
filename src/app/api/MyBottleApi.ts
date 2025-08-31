import { ApiResponse, ListQueryParams } from '@/types/common';
import {
  MyBottleTabType,
  PickMyBottleListResponse,
  RatingMyBottleListResponse,
  ReviewMyBottleListResponse,
} from '@/types/MyBottle';
import { apiClient } from '@/shared/api/apiClient';

export const MyBottleApi = {
  getMyBottle(type: MyBottleTabType) {
    if (type === 'ratings') return MyBottleApi.getRatings;
    if (type === 'reviews') return MyBottleApi.getReviews;
    if (type === 'picks') return MyBottleApi.getPicks;

    throw new Error('Invalid type');
  },

  async getReviews({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await apiClient.get<
      ApiResponse<ReviewMyBottleListResponse>
    >(
      `/my-page/${userId}/my-bottle/reviews?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    );

    return response;
  },

  async getRatings({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await apiClient.get<
      ApiResponse<RatingMyBottleListResponse>
    >(
      `/my-page/${userId}/my-bottle/ratings?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    );

    return response;
  },

  async getPicks({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await apiClient.get<ApiResponse<PickMyBottleListResponse>>(
      `/my-page/${userId}/my-bottle/picks?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    );

    return response;
  },
};
