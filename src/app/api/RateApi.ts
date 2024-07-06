import { RateAPI } from '@/types/Rate';
import { ApiResponse, ListQueryParams } from '@/types/common';

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

    const result: ApiResponse<{ ratings: RateAPI[] }> = await response.json();

    return result;
  },
};
