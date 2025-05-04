import { ApiResponse, ListQueryParams } from '@/types/common';
import {
  PickMyBottleListResponse,
  RatingMyBottleListResponse,
  ReviewMyBottleListResponse,
} from '@/types/MyBottle';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const MyBottleApi = {
  async getReviews({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await fetchWithAuth(
      `/bottle-api/my-page/${userId}/my-bottle/reviews?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const result: ApiResponse<ReviewMyBottleListResponse> = await response;

    return result;
  },

  async getRatings({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await fetchWithAuth(
      `/bottle-api/my-page/${userId}/my-bottle/ratings?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const result: ApiResponse<RatingMyBottleListResponse> = await response;

    return result;
  },

  async getPicks({
    params,
    userId,
  }: {
    params: ListQueryParams;
    userId: number;
  }) {
    const { keyword, regionId, sortType, sortOrder, cursor, pageSize } = params;

    const response = await fetchWithAuth(
      `/bottle-api/my-page/${userId}/my-bottle/picks?keyword=${decodeURI(keyword ?? '')}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const result: ApiResponse<PickMyBottleListResponse> = await response;

    return result;
  },
};
