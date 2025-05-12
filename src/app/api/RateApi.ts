import { RateAlcoholAPI, RateAPI, UserRatingApi } from '@/types/Rate';
import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

// TODO: API 수정되면 요청 방식 변경
export const RateApi = {
  async getList({
    keyword,
    category,
    regionId,
    sortType,
    sortOrder,
    cursor,
    pageSize,
  }: ListQueryParams) {
    const response = await fetch(
      `/bottle-api/rating?keyword=${keyword}&category=${category}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ ratings: RateAPI[]; totalCount: number }> =
      await response.json();

    const formattedResult: ApiResponse<{
      ratings: RateAlcoholAPI[];
      totalCount: number;
    }> = {
      ...result,
      data: {
        ...result.data,
        ratings: result.data.ratings.map((item) => ({
          ...item,
          engCategory: item.engCategoryName,
          korCategory: item.korCategoryName,
        })),
      },
    };

    return formattedResult;
  },

  async getUserRating(alcoholId: string) {
    const response = await fetchWithAuth(`/bottle-api/rating/${alcoholId}`, {
      requireAuth: false,
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<UserRatingApi> = await response;

    return result.data;
  },

  async postRating(params: { alcoholId: string; rating: number }) {
    const response = await fetchWithAuth(`/bottle-api/rating/register`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ message: string; rating: string }> =
      await response;
    return result.data;
  },
};
