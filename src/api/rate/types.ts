// ============================================
// Rate API - Request/Response Types
// ============================================

import { SORT_TYPE, SORT_ORDER } from '@/api/_shared/types';

// --------------- Request Types ---------------

export interface RateListParams {
  keyword?: string;
  category?: string;
  regionId?: number | '';
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
  cursor?: number;
  pageSize?: number;
}

export interface RatePostParams {
  alcoholId: string;
  rating: number;
}

// --------------- Response Types ---------------

// API 원본 응답 타입
export interface RateApiRaw {
  alcoholId: number;
  korName: string;
  engName: string;
  ratingCount: number;
  engCategoryName: string;
  korCategoryName: string;
  imageUrl: string;
  isPicked: boolean;
  totalCount: number;
}

// 변환된 타입
export interface RateAlcohol {
  alcoholId: number;
  korName: string;
  engName: string;
  ratingCount: number;
  engCategory: string;
  korCategory: string;
  imageUrl: string;
  isPicked: boolean;
}

export interface RateListResponse {
  ratings: RateAlcohol[];
  totalCount: number;
}

export interface UserRatingResponse {
  alcoholId: number;
  rating: number;
  userId: number;
}
