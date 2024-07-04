import { Review } from '@/types/Review';
// category는 정확히 정해지면 타입 지정하기
export interface AlcoholAPI {
  alcoholId: number;
  korName: string;
  engName: string;
  rating: number;
  engCategory: string;
  korCategory: string;
  imageUrl: string;
  isPicked?: false;
}
export interface Alcohol extends AlcoholAPI {
  path: string | { pathname: string; query?: any };
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
