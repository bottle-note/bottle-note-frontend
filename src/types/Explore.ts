export interface UserInfo {
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
  userInfo: UserInfo;
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
