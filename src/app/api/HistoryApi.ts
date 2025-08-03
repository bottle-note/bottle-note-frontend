import { ApiResponse } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import { HistoryListApi, HistoryListQueryParams } from '@/types/History';

export const HistoryApi = {
  async getHistoryList(
    baseParams: HistoryListQueryParams,
    filterParams?: string,
  ) {
    const { userId, cursor, pageSize } = baseParams;
    const response = await apiClient.get<ApiResponse<HistoryListApi>>(
      `/history/${userId}?cursor=${cursor}&pageSize=${pageSize}${filterParams ? `&${filterParams}` : ''}`,
    );

    return response;
  },
};
