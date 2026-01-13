import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  CurationListParams,
  CurationListData,
  CurationAlcoholsParams,
  CurationAlcoholsData,
} from './types';

export const CurationApi = {
  /**
   * 큐레이션 목록을 조회합니다.
   * @param params - 조회 파라미터
   * @returns 큐레이션 목록
   */
  async getCurations(
    params: CurationListParams = {},
  ): Promise<ApiResponse<CurationListData>> {
    const { keyword, alcoholId, cursor = 0, pageSize = 10 } = params;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
      keyword,
      alcoholId,
    });

    const response = await apiClient.get<ApiResponse<CurationListData>>(
      `/curations?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.CURATION_FETCH_FAILED);
    }

    return response;
  },

  /**
   * 특정 큐레이션의 위스키 목록을 조회합니다.
   * @param curationId - 큐레이션 ID
   * @param params - 페이지네이션 파라미터
   * @returns 위스키 목록
   */
  async getAlcoholsByCurationId(
    curationId: number,
    params: CurationAlcoholsParams = {},
  ): Promise<ApiResponse<CurationAlcoholsData>> {
    const { cursor = 0, pageSize = 10 } = params;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
    });

    const response = await apiClient.get<ApiResponse<CurationAlcoholsData>>(
      `/curations/${curationId}/alcohols?${queryString}`,
      { authRequired: false },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.CURATION_FETCH_FAILED);
    }

    return response;
  },
};

export type { CurationListParams, CurationAlcoholsParams } from './types';
