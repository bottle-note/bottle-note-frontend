// ============================================
// Follow API - Request/Response Types
// ============================================

import type { InfiniteListParams } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type RelationType = 'follower' | 'following';

export type RelationListParams = InfiniteListParams & {
  userId: number;
  type: RelationType;
};

export type FollowStatus = 'UNFOLLOW' | 'FOLLOWING';

export interface UpdateFollowParams {
  followUserId: number;
  status: FollowStatus;
}

// --------------- Response Types ---------------

export interface RelationInfo {
  userId: number;
  followUserId: number;
  followUserNickname: string;
  userProfileImage: string;
  status: FollowStatus;
  reviewCount: number;
  ratingCount: number;
}

export interface RelationListResponse {
  followingList: RelationInfo[];
  followerList: RelationInfo[];
}

export interface UpdateFollowResponse {
  followerId: number;
  nickName: string;
  imageUrl: string;
  message: string;
}
