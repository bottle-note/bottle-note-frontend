export type MyBottleTabType = 'ratings' | 'reviews' | 'picks';

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

export interface RatingMyBottleListResponse extends MyBottleListResponse {
  myBottleList: {
    baseMyBottleInfo: BaseMyBottleInfo;
    myRatingPoint: number;
    averageRatingPoint: number;
    averageRatingCount: number;
    ratingModifyAt: string;
  }[];
}

export interface ReviewMyBottleListResponse extends MyBottleListResponse {
  myBottleList: {
    baseMyBottleInfo: BaseMyBottleInfo;
    reviewId: number;
    isMyReview: boolean;
    reviewModifyAt: string;
    reviewContent: string;
    reviewTastingTags: string[];
    isBestReview: boolean;
  }[];
}

export interface PickMyBottleListResponse extends MyBottleListResponse {
  myBottleList: {
    baseMyBottleInfo: BaseMyBottleInfo;
    isPicPicksCount: number;
  }[];
}
