import { ApiResponse, ListQueryParams } from '@/types/common';
import {
  AlcoholAPI,
  RegionApi,
  CategoryApi,
  AlcoholDetails,
  PickPutApi,
} from '@/types/Alcohol';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const AlcoholsApi = {
  async getWeeklyPopular() {
    const response = await fetchWithAuth(`/bottle-api/popular/week`, {
      requireAuth: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ alcohols: AlcoholAPI[] }> = await response;

    const formattedData = result.data.alcohols.map((alcohol: AlcoholAPI) => {
      return {
        ...alcohol,
        path: `/search/${alcohol.engCategory}/${alcohol.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getSpringPopular() {
    const response = await fetchWithAuth(`/bottle-api/popular/spring`, {
      requireAuth: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<AlcoholAPI[]> = await response;

    const formattedData = result.data.map((data) => {
      return {
        ...data,
        path: `/search/${data.engCategory}/${data.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getHistory() {
    const response = await fetchWithAuth(`/bottle-api/history/view/alcohols`, {
      requireAuth: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ items: AlcoholAPI[] }> = await response;

    const formattedData = result.data.items.map((data) => {
      return {
        ...data,
        path: `/search/${data.engCategory}/${data.alcoholId}`,
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
      {
        cache: 'force-cache',
      },
    );

    const result: ApiResponse<CategoryApi[]> = await response.json();

    const categories = result.data.map((category) => {
      if (category.korCategory === '버번') {
        return { ...category, korCategory: '아메리칸(버번)' };
      }
      return category;
    });

    categories.unshift({
      korCategory: '전체',
      engCategory: 'All',
      categoryGroup: '',
    });

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
    const response = await fetchWithAuth(
      `/bottle-api/alcohols/search?keyword=${decodeURI(keyword ?? '')}&category=${category}&regionId=${regionId || ''}&sortType=${sortType}&sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        requireAuth: false,
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{ alcohols: any[]; totalCount: number }> =
      await response;

    const formattedResult: ApiResponse<{
      alcohols: AlcoholAPI[];
      totalCount: number;
    }> = {
      ...result,
      data: {
        ...result.data,
        alcohols: result.data.alcohols.map((item) => ({
          ...item,
          engCategory: item.engCategoryName,
          korCategory: item.korCategoryName,
        })),
      },
    };

    return formattedResult;
  },

  async getAlcoholDetails(alcoholId: string) {
    const response = await fetchWithAuth(`/bottle-api/alcohols/${alcoholId}`, {
      requireAuth: false,
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<AlcoholDetails> = await response;
    return result.data;
  },

  async putPick(alcoholId: string | number, isPicked: boolean) {
    const response = await fetchWithAuth(`/bottle-api/picks`, {
      method: 'PUT',
      body: JSON.stringify({
        alcoholId,
        isPicked: isPicked ? 'PICK' : 'UNPICK',
      }),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }
  },
};
