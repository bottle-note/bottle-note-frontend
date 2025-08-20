import { ApiResponse } from '@/types/common';
import { apiClient } from '@/shared/api/apiClient';
import { BlockListApi } from '@/types/Settings';

export const BlockApi = {
  async getBlockList() {
    const response = await apiClient.get<ApiResponse<BlockListApi>>(`/blocks`);

    return response;
  },

  async getBlockUserIdList() {
    const response = await apiClient.get<ApiResponse<string[]>>(`/blocks/ids`);

    return response;
  },

  async unblockUser(userId: string) {
    const response = await apiClient.delete<ApiResponse<BlockListApi>>(
      `/blocks/${userId}`,
    );

    return response;
  },

  async blockUser(userId: string) {
    const response = await apiClient.post<ApiResponse<BlockListApi>>(
      `/blocks`,
      { blockedUserId: userId },
    );

    return response;
  },
};
