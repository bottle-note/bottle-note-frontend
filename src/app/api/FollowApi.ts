import { ApiResponse } from '@/types/common';
import { RelationInfo } from '@/types/User';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export const FollowApi = {
  async getRelationList({
    userId,
    type,
  }: {
    userId: number;
    type: 'follower' | 'following';
  }) {
    const response: ApiResponse<{
      followingList: RelationInfo[];
      followerList: RelationInfo[];
      totalCount: number;
    }> = await fetchWithAuth(`/bottle-api/follow/${userId}/${type}-list`);

    if (!response.data) {
      throw new Error('Failed to fetch data');
    }

    return response;
  },

  async updateFollowingStatus({
    followUserId,
    status,
  }: {
    followUserId: number;
    status: RelationInfo['status'];
  }) {
    const response = await fetchWithAuth(`/bottle-api/follow`, {
      method: 'POST',
      body: JSON.stringify({
        followUserId,
        status,
      }),
    });

    if (response.errors.length !== 0) {
      throw new Error('Failed to fetch data');
    }

    const result: ApiResponse<{
      followerId: number;
      nickName: string;
      imageUrl: string;
      message: string;
    }> = await response.data;

    return result;
  },
};
