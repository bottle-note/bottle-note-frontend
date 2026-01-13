import { apiClient } from '@/shared/api/apiClient';
import { ApiResponse } from '@/api/_shared/types';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import type {
  RelationListParams,
  UpdateFollowParams,
  RelationListResponse,
  UpdateFollowResponse,
} from './types';

export const FollowApi = {
  /**
   * 팔로워/팔로잉 목록을 조회합니다.
   */
  async getRelationList(
    params: RelationListParams,
  ): Promise<ApiResponse<RelationListResponse>> {
    const { userId, type } = params;

    const response = await apiClient.get<ApiResponse<RelationListResponse>>(
      `/follow/${userId}/${type}-list`,
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }

    return response;
  },

  /**
   * 팔로우 상태를 변경합니다 (팔로우/언팔로우).
   */
  async updateFollowingStatus(
    params: UpdateFollowParams,
  ): Promise<ApiResponse<UpdateFollowResponse>> {
    const { followUserId, status } = params;

    const response = await apiClient.post<ApiResponse<UpdateFollowResponse>>(
      `/follow`,
      { followUserId, status },
      { authRequired: true },
    );

    if (response.errors.length !== 0) {
      const errorMessage =
        status === 'FOLLOWING'
          ? ERROR_MESSAGES.FOLLOW_FAILED
          : ERROR_MESSAGES.UNFOLLOW_FAILED;
      throw new Error(errorMessage);
    }

    return response;
  },
};

export type {
  RelationListParams,
  UpdateFollowParams,
  RelationInfo,
} from './types';
