import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { buildQueryParams } from '@/api/_shared/queryBuilder';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { BlockListParams, BlockListResponse } from './types';

export const BlockApi = {
  async getBlockList(
    params: BlockListParams,
  ): Promise<ApiResponse<BlockListResponse>> {
    const { cursor, size } = params;
    const queryString = buildQueryParams({ cursor, size });
    const response = await apiClient.get<ApiResponse<BlockListResponse>>(
      `/blocks?${queryString}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }

    return response;
  },

  async getBlockUserIdList(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<ApiResponse<string[]>>(`/blocks/ids`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }

    return response;
  },

  async unblockUser(userId: string): Promise<ApiResponse<BlockListResponse>> {
    const response = await apiClient.delete<ApiResponse<BlockListResponse>>(
      `/blocks/${userId}`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.UNBLOCK_FAILED);
    }

    return response;
  },

  async blockUser(userId: string): Promise<ApiResponse<BlockListResponse>> {
    const response = await apiClient.post<ApiResponse<BlockListResponse>>(
      `/blocks`,
      { blockedUserId: userId },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.BLOCK_FAILED);
    }

    return response;
  },
};

export type { BlockListParams, BlockListResponse, BlockedUser } from './types';
