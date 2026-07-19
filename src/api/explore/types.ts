// ============================================
// Explore API - Request/Response Types
// ============================================

import type { CursorPaginationParams } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type ExploreSortType =
  | 'POPULAR'
  | 'RATING'
  | 'PICK'
  | 'REVIEW'
  | 'RANDOM';

export type ExploreSortOrder = 'DESC' | 'ASC';

export type ExploreListParams = CursorPaginationParams & {
  keywords: string[];
  regionIds?: number[];
  category?: string;
  sortType?: ExploreSortType;
  sortOrder?: ExploreSortOrder;
  seed?: number;
  signal?: AbortSignal;
};

// --------------- Response Types ---------------

export interface ExploreUserInfo {
  userId: number;
  nickName: string;
  userProfileImage: string | null;
}

export interface ExploreAlcohol {
  alcoholId: number;
  alcoholUrlImg: string;
  korName: string;
  engName: string;
  korCategory: string;
  engCategory: string;
  korRegion: string;
  engRegion: string;
  cask: string;
  abv: string;
  korDistillery: string;
  engDistillery: string;
  rating: number;
  totalRatingsCount: number;
  myRating: number;
  myAvgRating: number;
  isPicked: boolean;
  alcoholsTastingTags: string[];
}

export interface ExploreReview {
  userInfo: ExploreUserInfo;
  isMyReview: boolean;
  alcoholId: number;
  alcoholName: string;
  reviewId: number;
  reviewContent: string;
  reviewRating: number;
  reviewTags: string[];
  createAt: string;
  modifiedAt: string;
  totalImageCount: number;
  reviewImages: string[];
  isBestReview: boolean;
  likeCount: number;
  isLikedByMe: boolean;
  replyCount: number;
  hasReplyByMe: boolean;
}

export interface ExploreReviewsResponse {
  items: ExploreReview[];
}

export interface ExploreAlcoholsResponse {
  items: ExploreAlcohol[];
}
