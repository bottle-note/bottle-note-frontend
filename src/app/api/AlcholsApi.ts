import { ApiResponse, ListQueryParams } from '@/types/common';
import {
  AlcoholAPI,
  RegionApi,
  CategoryApi,
  AlcoholDetails,
} from '@/types/Alcohol';
import { apiClient } from '@/shared/api/apiClient';

export const AlcoholsApi = {
  async getWeeklyPopular() {
    const response = await apiClient.get<
      ApiResponse<{ alcohols: AlcoholAPI[] }>
    >(`/popular/week`, {
      authRequired: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const formattedData = response.data.alcohols.map((alcohol: AlcoholAPI) => {
      return {
        ...alcohol,
        path: `/search/${alcohol.engCategory}/${alcohol.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getSpringPopular() {
    const response = await apiClient.get<ApiResponse<AlcoholAPI[]>>(
      `/popular/spring`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const formattedData = response.data.map((data) => {
      return {
        ...data,
        path: `/search/${data.engCategory}/${data.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getHistory() {
    const response = await apiClient.get<ApiResponse<{ items: AlcoholAPI[] }>>(
      `/history/view/alcohols`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const formattedData = response.data.items.map((data) => {
      return {
        ...data,
        path: `/search/${data.engCategory}/${data.alcoholId}`,
      };
    });

    return formattedData;
  },

  async getRegion() {
    const response = await apiClient.get<ApiResponse<RegionApi[]>>(`/regions`, {
      authRequired: false,
    });

    const regions = response.data.map((region) => {
      return {
        id: region.regionId,
        value: region.korName,
      };
    });

    regions.unshift({ id: -1, value: '국가(전체)' });

    return regions;
  },

  async getCategory(type = 'WHISKY') {
    const response = await apiClient.get<ApiResponse<CategoryApi[]>>(
      `/alcohols/categories?type=${type}`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    const categories = response.data.map((category) => {
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
    // URLSearchParams를 사용하여 안전하게 쿼리 구성
    const params = new URLSearchParams();

    if (keyword) params.set('keyword', keyword);
    if (category && category !== 'ALL') params.set('category', category);
    if (regionId !== undefined && regionId !== '')
      params.set('regionId', String(regionId));
    if (sortType) params.set('sortType', sortType);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (cursor !== undefined) params.set('cursor', String(cursor));
    if (pageSize !== undefined) params.set('pageSize', String(pageSize));

    const response = await apiClient.get<
      ApiResponse<{ alcohols: any[]; totalCount: number }>
    >(`/alcohols/search?${params.toString()}`, {
      authRequired: false,
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const formattedResult: ApiResponse<{
      alcohols: AlcoholAPI[];
      totalCount: number;
    }> = {
      ...response,
      data: {
        ...response.data,
        alcohols: response.data.alcohols.map((item) => ({
          ...item,
          engCategory: item.engCategoryName,
          korCategory: item.korCategoryName,
        })),
      },
    };

    return formattedResult;
  },

  async getAlcoholDetails(alcoholId: string) {
    const response = await apiClient.get<ApiResponse<AlcoholDetails>>(
      `/alcohols/${alcoholId}`,
      {
        authRequired: false,
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    return response.data;
  },

  async putPick(alcoholId: string | number, isPicked: boolean) {
    const response = await apiClient.put<ApiResponse<any>>(`/picks`, {
      alcoholId,
      isPicked: isPicked ? 'PICK' : 'UNPICK',
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }
  },
};
