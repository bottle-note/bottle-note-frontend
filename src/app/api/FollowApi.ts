import { ApiResponse } from '@/types/common';
import { RelationInfo } from '@/types/User';
import { apiClient } from '@/shared/api/apiClient';

export const FollowApi = {
  async getRelationList({
    userId,
    type,
  }: {
    userId: number;
    type: 'follower' | 'following';
  }) {
    const response = await apiClient.get<
      ApiResponse<{
        followingList: RelationInfo[];
        followerList: RelationInfo[];
        totalCount: number;
      }>
    >(`/follow/${userId}/${type}-list`);

    return response;
  },

  async updateFollowingStatus({
    followUserId,
    status,
  }: {
    followUserId: number;
    status: RelationInfo['status'];
  }) {
    const response = await apiClient.post<
      ApiResponse<{
        followerId: number;
        nickName: string;
        imageUrl: string;
        message: string;
      }>
    >(`/follow`, {
      followUserId,
      status,
    });

    return response.data;
  },
};
