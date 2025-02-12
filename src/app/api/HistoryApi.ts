import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { HistoryListApi } from '@/types/History';

interface HistoryListQueryParams extends ListQueryParams {
  userId: string;
  ratingPoint?: number;
  historyReviewFilterType?:
    | 'ALL'
    | 'BEST_REVIEW'
    | 'REVIEW_LIKE'
    | 'REVIEW_REPLY';
  picksStatus?: 'PICK' | 'UNPICK';
  startDate?: string;
  endDate?: string;
}

export const HistoryApi = {
  async getHistoryList({
    userId,
    ratingPoint,
    historyReviewFilterType = 'ALL',
    picksStatus,
    startDate,
    endDate,
    sortOrder,
    cursor,
    pageSize,
  }: HistoryListQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/history/${userId}?cursor=${cursor}&pageSize=${pageSize}`,
      { requireAuth: true },
    );

    //   const response = await fetchWithAuth(
    //     `/bottle-api/history/${userId}?ratingPoint=${ratingPoint}&historyReviewFilterType=${historyReviewFilterType}
    // &picksStatus=${picksStatus}&startDate=${startDate}&endDate${endDate}
    // &sortOrder=${sortOrder}&cursor=${cursor}&pageSize=${pageSize}`,
    //     { requireAuth: true },
    //   );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<HistoryListApi> = await response;

    return result;
  },
};
