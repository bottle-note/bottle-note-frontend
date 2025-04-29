import { Review } from '@/types/Review';
import { Category } from './common';

export interface AlcoholAPI {
  alcoholId: number;
  korName: string;
  engName: string;
  rating: number;
  ratingCount: number;
  korCategory: string;
  engCategory: string;
  imageUrl: string;
  isPicked: boolean;
  popularScore: number;
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
    user_image_url: string;
    userId: number;
    nickName: string;
    rating: number;
  }[];
}

export interface AlcoholDetails {
  alcohols: AlcoholInfo;
  friendsInfo: FriendsInfo;
  reviewInfo: {
    totalCount: number;
    reviewList: Review[];
  };
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
