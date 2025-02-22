import { ApiResponse } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { HistoryListApi, HistoryListQueryParams } from '@/types/History';

export const HistoryApi = {
  async getHistoryList(
    baseParams: HistoryListQueryParams,
    filterParams?: string,
  ) {
    const { userId, cursor, pageSize } = baseParams;
    const response = await fetchWithAuth(
      `/bottle-api/history/${userId}?cursor=${cursor}&pageSize=${pageSize}${filterParams ? `&${filterParams}` : ''}`,
      { requireAuth: true },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<HistoryListApi> = await response;

    return result;
  },
};
