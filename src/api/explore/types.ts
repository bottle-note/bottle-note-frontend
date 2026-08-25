// ============================================
// Explore API - Request/Response Types
// ============================================

import type { InfiniteListParams } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type ExploreSortType =
  | 'POPULAR'
  | 'RATING'
  | 'PICK'
  | 'REVIEW'
  | 'RANDOM';

export type ReviewExploreSortType =
  | 'LATEST'
  | 'POPULAR'
  | 'LIKES'
  | 'RATING'
  | 'BOTTLE_PRICE'
  | 'GLASS_PRICE';

export type ExploreSortOrder = 'DESC' | 'ASC';

export type ExploreListParams = InfiniteListParams & {
  keywords: string[];
  regionIds?: number[];
  category?: string;
  sortType?: ExploreSortType;
  sortOrder?: ExploreSortOrder;
  ratingFrom?: number;
  ratingTo?: number;
  signal?: AbortSignal;
};

export type ExploreReviewsParams = InfiniteListParams & {
  keyword?: string;
  sortType: ReviewExploreSortType;
  sortOrder: ExploreSortOrder;
  ratingFrom?: number;
  ratingTo?: number;
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

export interface ExploreLocationInfo {
  locationName?: string | null;
  zipCode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
  category?: string | null;
  mapUrl?: string | null;
  latitude?: string | null;
  longitude?: string | null;
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
  locationInfo?: ExploreLocationInfo | null;
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
