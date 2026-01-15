// ============================================
// MyBottle API - Request/Response Types
// ============================================

import { SORT_TYPE, SORT_ORDER } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type MyBottleTabType = 'ratings' | 'reviews' | 'picks';

export interface MyBottleListParams {
  keyword?: string;
  regionId?: number | '';
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
  cursor?: number;
  pageSize?: number;
}

// --------------- Response Types ---------------

interface BaseMyBottleInfo {
  alcoholId: number;
  alcoholKorName: string;
  alcoholEngName: string;
  korCategoryName: string;
  imageUrl: string;
  isHot: boolean;
}

interface MyBottleListResponse {
  userId: number;
  isMyPage: boolean;
  totalCount: number;
}

export interface RatingMyBottleItem {
  baseMyBottleInfo: BaseMyBottleInfo;
  myRatingPoint: number;
  averageRatingPoint: number;
  averageRatingCount: number;
  ratingModifyAt: string;
}

export interface RatingMyBottleListResponse extends MyBottleListResponse {
  myBottleList: RatingMyBottleItem[];
}

export interface ReviewMyBottleItem {
  baseMyBottleInfo: BaseMyBottleInfo;
  reviewId: number;
  isMyReview: boolean;
  reviewModifyAt: string;
  reviewContent: string;
  reviewTastingTags: string[];
  isBestReview: boolean;
}

export interface ReviewMyBottleListResponse extends MyBottleListResponse {
  myBottleList: ReviewMyBottleItem[];
}

export interface PickMyBottleItem {
  baseMyBottleInfo: BaseMyBottleInfo;
  isPicked: boolean;
  totalPicksCount: number;
}

export interface PickMyBottleListResponse extends MyBottleListResponse {
  myBottleList: PickMyBottleItem[];
}
