// ============================================
// Explore API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface ExploreListParams {
  keywords: string[];
  cursor?: number;
  pageSize?: number;
}

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
