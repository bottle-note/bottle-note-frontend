import { Review } from '@/types/Review';

export interface AlcoholAPI {
  alcoholId: number;
  imageUrl: string;
  korName: string;
  engName: string;
  korCategoryName: string;
  engCategoryName: string;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  pickCount: string;
  isPicked?: false;
}
export interface WeeklyAlcohol
  extends Omit<Omit<AlcoholAPI, 'korCategoryName'>, 'engCategoryName'> {
  path: string | { pathname: string; query?: any };
  korCategory: string;
  engCategory: string;
}

export interface AlcoholDetails {
  alcohols: {
    // rating한 user count는?
    alcoholId: number;
    alcoholUrlImg: string;
    korName: string;
    engName: string;
    korCategory: string;
    engCategory: string;
    korRegion: string;
    engRegion: string;
    cask: string;
    avg: string;
    korDistillery: string;
    engDistillery: string;
    rating: number;
    totalRatingsCount: number;
    totalRatings: number;
    myRating: number;
    isPicked: boolean;
    tags: string[];
  };
  friendsInfo: {
    followerCount: number;
    friends: {
      user_image_url: string;
      userId: number;
      nickName: string;
      rating: number;
    }[];
  };
  reviews: {
    totalReviewCount: number;
    bestReviewInfos: Review[];
    recentReviewInfos: Review[];
  };
}

export interface RegionApi {
  regionId: number;
  korName: string;
  engName: string;
  description: string;
}

export interface CategoryApi {
  korCategory: string;
  engCategory: string;
}
