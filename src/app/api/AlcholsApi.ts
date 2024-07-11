import {
  AlcoholAPI,
  CategoryApi,
  RegionApi,
  WeeklyAlcohol,
} from '@/types/Alcohol';
import { ApiResponse, ListQueryParams } from '@/types/common';

export const AlcoholsApi = {
  async getPopular() {
    const response = await fetch(`/bottle-api/popular/week`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ alcohols: WeeklyAlcohol[] }> =
      await response.json();

    const formattedData = result.data.alcohols.map((alcohol: WeeklyAlcohol) => {
      return {
        ...alcohol,
        path: `/search/${alcohol.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getRegion() {
    const response = await fetch(`/bottle-api/regions`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<RegionApi[]> = await response.json();

    const regions = result.data.map((region) => {
      return {
        id: region.regionId,
        value: region.korName,
      };
    });

    regions.unshift({ id: -1, value: '국가(전체)' });

    return regions;
  },

  async getCategory(type = 'WHISKY') {
    const response = await fetch(
      `/bottle-api/alcohols/categories?type=${type}`,
      { cache: 'force-cache' },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<CategoryApi[]> = await response.json();

    const categories = result.data.map((category) => {
      if (category.korCategory === '버번') {
        return { ...category, korCategory: '아메리칸(버번)' };
      }
      return category;
    });

    categories.unshift({ korCategory: '전체', engCategory: 'All' });

    return categories;
  },

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
      `/bottle-api/alcohols/search?keyword=${keyword}&category=${category}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
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

    // TODO: 카테고리 필드 명 변경하여 수정해주기
    const result: ApiResponse<{ alcohols: AlcoholAPI[]; totalCount: number }> =
      await response.json();

    return result;
  },
};
