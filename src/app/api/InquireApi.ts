import { ApiResponse, ListQueryParams } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import {
  InquirePostApi,
  InquireQueryParams,
  InquireListApi,
} from '@/types/Inquire';

export const InquireApi = {
  async getInquireList({ cursor, pageSize }: ListQueryParams) {
    const response = await fetchWithAuth(
      `/bottle-api/help?cursor=${cursor}&pageSize=${pageSize}`,
    );
    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<InquireListApi> = await response;
    return result;
  },

  async registerInquire(params: InquireQueryParams) {
    const response = await fetchWithAuth(`/bottle-api/help`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<InquirePostApi> = await response;
    return result.data;
  },
};
