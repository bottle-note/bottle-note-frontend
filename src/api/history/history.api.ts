import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { HistoryListQueryParams, HistoryListResponse } from './types';

export const HistoryApi = {
  /**
   * 사용자의 활동 히스토리 목록을 조회합니다.
   * @param baseParams - 기본 조회 파라미터
   * @param filterParams - 필터 파라미터 (쿼리 스트링 형태)
   * @returns 히스토리 목록
   */
  async getHistoryList(
    baseParams: HistoryListQueryParams,
    filterParams?: string,
  ): Promise<ApiResponse<HistoryListResponse>> {
    const { userId, cursor, pageSize } = baseParams;

    const queryString = buildQueryParams({
      cursor,
      pageSize,
    });

    const fullQueryString = filterParams
      ? `${queryString}&${filterParams}`
      : queryString;

    const response = await apiClient.get<ApiResponse<HistoryListResponse>>(
      `/history/${userId}?${fullQueryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.HISTORY_FETCH_FAILED);
    }

    return response;
  },
};

export type {
  HistoryListQueryParams,
  History,
  HistoryListResponse,
} from './types';
