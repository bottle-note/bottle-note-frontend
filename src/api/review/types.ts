// ============================================
// Review API - Request/Response Types
// ============================================

import { SORT_TYPE, SORT_ORDER } from '@/api/_shared/types';

// --------------- Request Types ---------------

export interface ReviewListParams {
  alcoholId: string;
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
  cursor?: number;
  pageSize?: number;
}

export interface ReviewQueryParams {
  alcoholId?: string;
  content: string;
  status: string;
  sizeType: 'GLASS' | 'BOTTLE' | null;
  price?: number | null;
  tastingTagList?: string[] | null;
  rating: number;
  imageUrlList?:
    | {
        order: number;
        viewUrl: string;
      }[]
    | null;
  locationInfo: {
    locationName?: string | null;
    zipCode?: string | null;
    address?: string | null;
    detailAddress?: string | null;
    category?: string | null;
    mapUrl?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  };
}

export interface LikeParams {
  reviewId: string | number;
  isLiked: boolean;
}

export interface VisibilityParams {
  reviewId: string | number;
  status: 'PUBLIC' | 'PRIVATE';
}

// --------------- Response Types ---------------

export interface ReviewUserInfo {
  userId: number;
  nickName: string;
  userProfileImage?: string | null;
}

export interface ReviewLocationInfo {
  name?: string;
  zipCode?: string | null;
  address?: string;
  detailAddress?: string;
  category?: string;
  mapUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface Review {
  reviewId: number;
  reviewContent: string;
  price: number;
  sizeType: 'BOTTLE' | 'GLASS';
  likeCount: number;
  replyCount: number;
  reviewImageUrl: string | null;
  totalImageCount: number;
  userInfo: ReviewUserInfo;
  viewCount: number;
  locationInfo: ReviewLocationInfo | null;
  status: 'PUBLIC' | 'PRIVATE';
  isMyReview: boolean;
  isLikedByMe: boolean;
  hasReplyByMe: boolean;
  isBestReview: boolean;
  tastingTagList?: string[];
  createAt: string;
  rating: number;
}

export interface ReviewListResponse {
  reviewList: Review[];
  totalCount: number;
}

export interface ReviewAlcoholInfo {
  alcoholId: number;
  korName: string;
  engName: string;
  korCategory: string;
  engCategory: string;
  imageUrl: string;
  isPicked: boolean;
  rating: number;
  totalRatingsCount: number;
}

// API 원본 응답 (카테고리명 변환 필요)
export interface ReviewAlcoholInfoRaw {
  alcoholId: number;
  korName: string;
  engName: string;
  korCategoryName?: string;
  engCategoryName?: string;
  korCategory?: string;
  engCategory?: string;
  imageUrl: string;
  isPicked: boolean;
  rating: number;
  totalRatingsCount: number;
}

export interface ReviewDetailsResponse {
  alcoholInfo: ReviewAlcoholInfo;
  reviewInfo: Review;
  reviewImageList: {
    order: number;
    viewUrl: string;
  }[];
}

export interface ReviewPostResponse {
  callback: string;
  content: string;
  id: number;
}

export interface ReviewPatchResponse {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}

export interface ReviewLikeResponse {
  message: string;
  likedId: number;
  reviewId: number;
  userId: number;
  userNickName: string;
  status: 'LIKE' | 'DISLIKE';
}

export interface ReviewVisibilityResponse {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}
