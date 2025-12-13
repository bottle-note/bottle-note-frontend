import { ApiResponse } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import {
  CurationListParams,
  CurationListData,
  CurationAlcoholsParams,
  CurationAlcoholsData,
} from '@/types/Curation';

export const CurationApi = {
  async getCurations(
    params: CurationListParams = {},
  ): Promise<ApiResponse<CurationListData>> {
    const { keyword, alcoholId, cursor = 0, pageSize = 10 } = params;

    const searchParams = new URLSearchParams({
      cursor: cursor.toString(),
      pageSize: pageSize.toString(),
      ...(keyword && { keyword }),
      ...(alcoholId && { alcoholId: alcoholId.toString() }),
    });

    const response = await apiClient.get<ApiResponse<CurationListData>>(
      `/curations?${searchParams.toString()}`,
      {
        authRequired: false,
      },
    );

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch curations');
    }

    return response;
  },

  async getAlcoholsByCurationId(
    curationId: number,
    params: CurationAlcoholsParams = {},
  ): Promise<ApiResponse<CurationAlcoholsData>> {
    const { cursor = 0, pageSize = 10 } = params;

    const searchParams = new URLSearchParams({
      cursor: cursor.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await apiClient.get<ApiResponse<CurationAlcoholsData>>(
      `/curations/${curationId}/alcohols?${searchParams.toString()}`,
      {
        authRequired: false,
      },
    );

    if (response.errors.length !== 0) {
      throw new Error(`Failed to fetch alcohols for curation ${curationId}`);
    }

    return response;
  },
};
