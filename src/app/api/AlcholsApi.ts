import { AlcoholAPI, CategoryApi, RegionApi } from '@/types/Alcohol';
import { ApiResponse } from '@/types/common';

export const AlcoholsApi = {
  async getPopular() {
    const response = await fetch(`/bottle-api/popular/week`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ alcohols: AlcoholAPI[] }> =
      await response.json();

    const formattedData = result.data.alcohols.map((alcohol: AlcoholAPI) => {
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
};
