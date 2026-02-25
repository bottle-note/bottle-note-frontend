import { apiClient } from '@/shared/api/apiClient';
import type { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { Banner } from './types';

export const BannerApi = {
  async getBanners(limit: number = 10): Promise<ApiResponse<Banner[]>> {
    const response = await apiClient.get<ApiResponse<Banner[]>>(
      `/banners?limit=${limit}`,
      { authRequired: false, cache: 'force-cache' },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.BANNER_FETCH_FAILED);
    }

    return response;
  },
};
