import { Review } from '@/types/Review';
import { Category } from './common';

export interface AlcoholAPI {
  alcoholId: number;
  imageUrl: string;
  korName: string;
  engName: string;
  korCategory: string;
  engCategory: string;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  pickCount: number;
  isPicked: boolean;
}

export interface AlcoholDetails {
  alcohols: AlcoholInfo;
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
  avg: string;
  korDistillery: string;
  engDistillery: string;
  rating: number;
  totalRatingsCount: number;
  totalRatings: number;
  myRating: number;
  isPicked: boolean;
  tags: string[];
}

export interface RegionApi {
  regionId: number;
  korName: string;
  engName: string;
  description: string;
}

export interface PickPutApi {
  message: string;
  status: 'PICK' | 'UNPICK';
}

export interface CategoryApi {
  korCategory: string;
  engCategory: string;
  categoryGroup: Category;
}
