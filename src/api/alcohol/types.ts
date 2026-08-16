// ============================================
// Alcohol API - Request/Response Types
// ============================================

// --------------- Request Types ---------------

export interface PickParams {
  alcoholId: string | number;
  isPicked: boolean;
}

// --------------- Response Types (API 원본) ---------------

export interface AlcoholApiRaw {
  alcoholId: number;
  korName: string;
  engName: string;
  rating: number;
  ratingCount: number;
  korCategoryName?: string;
  engCategoryName?: string;
  korCategory?: string;
  engCategory?: string;
  imageUrl: string;
  isPicked: boolean;
  popularScore?: number;
}

// --------------- Response Types (변환 후) ---------------

export interface Alcohol {
  alcoholId: number;
  korName: string;
  engName: string;
  rating: number;
  ratingCount: number;
  korCategory: string;
  engCategory: string;
  imageUrl: string;
  isPicked: boolean;
  popularScore?: number;
  path?: string;
}

export interface AlcoholInfo {
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
  myAvgRating: number;
  myRating: number;
  totalRatingsCount: number;
  isPicked: boolean;
  alcoholsTastingTags: string[];
}

export interface FriendsInfo {
  followerCount: number;
  friends: {
    userImageUrl: string | null;
    userId: number;
    nickName: string;
    rating: number;
  }[];
}

export interface ReviewInDetails {
  reviewId: number;
  reviewContent: string;
  price: number;
  sizeType: 'BOTTLE' | 'GLASS';
  likeCount: number;
  replyCount: number;
  reviewImageUrl: string | null;
  totalImageCount: number;
  userInfo: {
    userId: number;
    nickName: string;
    userProfileImage?: string | null;
  };
  viewCount: number;
  status: 'PUBLIC' | 'PRIVATE';
  isMyReview: boolean;
  isLikedByMe: boolean;
  hasReplyByMe: boolean;
  isBestReview: boolean;
  tastingTagList?: string[];
  createAt: string;
  rating: number;
}

export interface AlcoholDetailsResponse {
  alcohols: AlcoholInfo;
  friendsInfo: FriendsInfo;
  reviewInfo: {
    totalCount: number;
    reviewList: ReviewInDetails[];
  };
}

export interface RegionResponse {
  regionId: number;
  korName: string;
  engName: string;
  description: string;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number;
}

export interface CategoryResponse {
  korCategory: string;
  engCategory: string;
  categoryGroup: string;
}

export interface PickResponse {
  message: string;
  status: 'PICK' | 'UNPICK';
}
