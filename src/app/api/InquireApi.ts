import { ApiResponse } from '@/types/common';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { InquirePostApi, InquireQueryParams } from '@/types/Inquire';

export const InquireApi = {
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
