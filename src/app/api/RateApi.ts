import { RateAlcoholAPI, RateAPI, UserRatingApi } from '@/types/Rate';
import { ApiResponse, ListQueryParams } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';

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
    const response = await apiClient.get<
      ApiResponse<{ ratings: RateAPI[]; totalCount: number }>
    >(
      `/rating?keyword=${keyword}&category=${category}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      { authRequired: false },
    );

    const formattedResult: ApiResponse<{
      ratings: RateAlcoholAPI[];
      totalCount: number;
    }> = {
      ...response,
      data: {
        ...response.data,
        ratings: response.data.ratings.map((item) => ({
          ...item,
          engCategory: item.engCategoryName,
          korCategory: item.korCategoryName,
        })),
      },
    };

    return formattedResult;
  },

  async getUserRating(alcoholId: string) {
    const response = await apiClient.get<ApiResponse<UserRatingApi>>(
      `/rating/${alcoholId}`,
      { authRequired: false },
    );

    return response.data;
  },

  async postRating(params: { alcoholId: string; rating: number }) {
    await apiClient.post(`/rating/register`, params);
  },
};
