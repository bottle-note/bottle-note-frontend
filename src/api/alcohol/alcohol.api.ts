import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import {
  transformAlcoholList,
  transformCategories,
  transformRegions,
} from './transformers';
import type {
  AlcoholListParams,
  AlcoholApiRaw,
  Alcohol,
  AlcoholListResponse,
  AlcoholDetailsResponse,
  RegionResponse,
  CategoryResponse,
  PickParams,
  PickResponse,
} from './types';

export const AlcoholsApi = {
  /**
   * 주간 인기 위스키 목록을 조회합니다.
   */
  async getWeeklyPopular(): Promise<ApiResponse<{ alcohols: Alcohol[] }>> {
    const response = await apiClient.get<
      ApiResponse<{ alcohols: AlcoholApiRaw[] }>
    >(`/popular/week`, {
      authRequired: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_LIST_FETCH_FAILED);
    }

    return {
      ...response,
      data: {
        alcohols: transformAlcoholList(response.data.alcohols),
      },
    };
  },

  /**
   * 주간 조회수 기반 인기 위스키 목록을 조회합니다.
   */
  async getWeeklyViewPopular(
    top = 5,
  ): Promise<ApiResponse<{ totalCount: number; alcohols: Alcohol[] }>> {
    const response = await apiClient.get<
      ApiResponse<{ totalCount: number; alcohols: AlcoholApiRaw[] }>
    >(`/popular/view/week?top=${top}`, {
      authRequired: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_LIST_FETCH_FAILED);
    }

    return {
      ...response,
      data: {
        totalCount: response.data.totalCount,
        alcohols: transformAlcoholList(response.data.alcohols),
      },
    };
  },

  /**
   * 봄 시즌 인기 위스키 목록을 조회합니다.
   */
  async getSpringPopular(): Promise<ApiResponse<Alcohol[]>> {
    const response = await apiClient.get<ApiResponse<AlcoholApiRaw[]>>(
      `/popular/spring`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_LIST_FETCH_FAILED);
    }

    return {
      ...response,
      data: transformAlcoholList(response.data),
    };
  },

  /**
   * 최근 본 위스키 목록을 조회합니다.
   */
  async getHistory(): Promise<ApiResponse<{ items: Alcohol[] }>> {
    const response = await apiClient.get<
      ApiResponse<{ items: AlcoholApiRaw[] }>
    >(`/history/view/alcohols`, {
      authRequired: false,
      cache: 'force-cache',
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_LIST_FETCH_FAILED);
    }

    return {
      ...response,
      data: {
        items: transformAlcoholList(response.data.items),
      },
    };
  },

  /**
   * 지역 목록을 조회합니다.
   */
  async getRegion(): Promise<ApiResponse<{ id: number; value: string }[]>> {
    const response = await apiClient.get<ApiResponse<RegionResponse[]>>(
      `/regions`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_FETCH_FAILED);
    }

    return {
      ...response,
      data: transformRegions(response.data),
    };
  },

  /**
   * 카테고리 목록을 조회합니다.
   */
  async getCategory(type = 'WHISKY'): Promise<ApiResponse<CategoryResponse[]>> {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
      `/alcohols/categories?type=${type}`,
      {
        authRequired: false,
        cache: 'force-cache',
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_FETCH_FAILED);
    }

    return {
      ...response,
      data: transformCategories(response.data),
    };
  },

  /**
   * 위스키 목록을 검색합니다.
   */
  async getList(
    params: AlcoholListParams,
  ): Promise<ApiResponse<AlcoholListResponse>> {
    const {
      keyword,
      category,
      regionId,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    } = params;

    const queryString = buildQueryParams({
      keyword,
      category: category !== 'ALL' ? category : undefined,
      regionId: regionId || undefined,
      sortType,
      sortOrder,
      cursor,
      pageSize,
    });

    const response = await apiClient.get<
      ApiResponse<{ alcohols: AlcoholApiRaw[]; totalCount: number }>
    >(`/alcohols/search?${queryString}`, { authRequired: false });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_LIST_FETCH_FAILED);
    }

    return {
      ...response,
      data: {
        alcohols: transformAlcoholList(response.data.alcohols),
        totalCount: response.data.totalCount,
      },
    };
  },

  /**
   * 위스키 상세 정보를 조회합니다.
   */
  async getAlcoholDetails(
    alcoholId: string,
  ): Promise<ApiResponse<AlcoholDetailsResponse>> {
    const response = await apiClient.get<ApiResponse<AlcoholDetailsResponse>>(
      `/alcohols/${alcoholId}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.ALCOHOL_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 위스키를 픽/언픽합니다.
   */
  async putPick(params: PickParams): Promise<ApiResponse<PickResponse>> {
    const { alcoholId, isPicked } = params;

    const response = await apiClient.put<ApiResponse<PickResponse>>(
      `/picks`,
      {
        alcoholId,
        isPicked: isPicked ? 'PICK' : 'UNPICK',
      },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.PICK_FAILED);
    }

    return response;
  },
};

export type {
  AlcoholListParams,
  Alcohol,
  AlcoholDetailsResponse,
} from './types';
