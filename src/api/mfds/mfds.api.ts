import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  MfdsAlcoholCategory,
  MfdsAlcoholDetail,
  MfdsAlcoholListItem,
  MfdsAlcoholListParams,
  MfdsCountry,
  MfdsImporter,
  MfdsImporterListParams,
} from './types';

export const MfdsApi = {
  /**
   * 수입 주류 목록을 조회합니다. 처리일자 내림차순이며 처리일자가 없는 항목은 뒤에 옵니다.
   * 다음 페이지는 meta.pagination.nextCursor를 cursor로 넘겨 조회합니다.
   */
  async getAlcohols(
    params: MfdsAlcoholListParams = {},
  ): Promise<ApiResponse<MfdsAlcoholListItem[]>> {
    const { signal, ...queryParams } = params;
    const queryString = buildQueryParams({ ...queryParams });

    const response = await apiClient.get<ApiResponse<MfdsAlcoholListItem[]>>(
      `/mfds/alcohols?${queryString}`,
      { authRequired: false, signal },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.IMPORT_CLEARANCE_LIST_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 수입 주류 상세를 조회합니다.
   * @param id 수입 신고 레코드 ID (BottleNote 주류 ID가 아닙니다)
   */
  async getAlcohol(
    id: string | number,
  ): Promise<ApiResponse<MfdsAlcoholDetail>> {
    const response = await apiClient.get<ApiResponse<MfdsAlcoholDetail>>(
      `/mfds/alcohols/${id}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.IMPORT_CLEARANCE_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 수입사 목록을 조회합니다.
   * 다음 페이지는 meta.pagination.nextCursor를 cursor로 넘겨 조회합니다.
   */
  async getImporters(
    params: MfdsImporterListParams = {},
  ): Promise<ApiResponse<MfdsImporter[]>> {
    const { signal, ...queryParams } = params;
    const queryString = buildQueryParams({ ...queryParams });

    const response = await apiClient.get<ApiResponse<MfdsImporter[]>>(
      `/mfds/importers?${queryString}`,
      { authRequired: false, signal },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.IMPORT_CLEARANCE_LIST_FETCH_FAILED);
    }

    return response;
  },

  /** 공개 대상 수입사 상세를 조회합니다. */
  async getImporter(id: string | number): Promise<ApiResponse<MfdsImporter>> {
    const response = await apiClient.get<ApiResponse<MfdsImporter>>(
      `/mfds/importers/${id}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error('수입사 정보를 불러오는데 실패했습니다.');
    }

    return response;
  },

  /** 원장에 등장한 수출국 목록을 조회합니다. exportCountry 필터 옵션으로 씁니다. */
  async getCountries(): Promise<ApiResponse<MfdsCountry[]>> {
    const response = await apiClient.get<ApiResponse<MfdsCountry[]>>(
      '/mfds/countries',
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.IMPORT_CLEARANCE_COUNTRY_FETCH_FAILED);
    }

    return response;
  },

  /** 원장에 등장한 카테고리 목록을 조회합니다. alcoholCategoryKo 필터 옵션으로 씁니다. */
  async getAlcoholCategories(): Promise<ApiResponse<MfdsAlcoholCategory[]>> {
    const response = await apiClient.get<ApiResponse<MfdsAlcoholCategory[]>>(
      '/mfds/alcohols/category',
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.IMPORT_CLEARANCE_CATEGORY_FETCH_FAILED);
    }

    return response;
  },
};

export type {
  MfdsAlcoholCategory,
  MfdsAlcoholDetail,
  MfdsAlcoholListItem,
  MfdsAlcoholListParams,
  MfdsCountry,
  MfdsImporter,
} from './types';
