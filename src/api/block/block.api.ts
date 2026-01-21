import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type { BlockListResponse } from './types';

export const BlockApi = {
  /**
   * 차단 목록을 조회합니다.
   */
  async getBlockList(): Promise<ApiResponse<BlockListResponse>> {
    const response = await apiClient.get<ApiResponse<BlockListResponse>>(
      `/blocks`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }

    return response;
  },

  /**
   * 차단된 사용자 ID 목록만 조회합니다.
   */
  async getBlockUserIdList(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<ApiResponse<string[]>>(`/blocks/ids`, {
      authRequired: true,
    });

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }

    return response;
  },

  /**
   * 사용자 차단을 해제합니다.
   */
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

  /**
   * 사용자를 차단합니다.
   */
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

export type { BlockListResponse, BlockedUser } from './types';
