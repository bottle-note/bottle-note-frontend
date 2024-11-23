import { ReviewUserInfo } from './User';

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

export interface AlcoholInfo {
  alcoholId: number;
  korName: string;
  engName: string;
  korCategory: string;
  engCategory: string;
  imageUrl: string;
  isPicked: boolean;
}

export interface Review {
  reviewId: number;
  reviewContent: string;
  price: number;
  sizeType: 'BOTTLE' | 'GLASS';
  likeCount: number;
  replyCount: number;
  reviewImageUrl: string | null;
  userInfo: ReviewUserInfo;
  rating: number;
  viewCount: number;
  locationInfo: ReviewLocationInfo;
  status: 'PUBLIC' | 'PRIVATE';
  isMyReview: boolean;
  isLikedByMe: boolean;
  hasReplyByMe: boolean;
  isBestReview: boolean;
  tastingTagList?: string[];
  createAt: string;
}

export interface FormValues {
  review: string;
  status: string;
  price_type: 'GLASS' | 'BOTTLE';
  price?: number | null;
  flavor_tags?: string[] | null;
  rating?: number | null;
  images?: { order: number; image: File }[] | null;
  imageUrlList?:
    | {
        order: number;
        viewUrl: string;
      }[]
    | null;
  locationName?: string | null;
  zipCode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
  category?: string | null;
  mapUrl?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface ReviewListApi {
  reviewList: Review[];
  totalCount: number;
}

export interface ReviewDetailsApi {
  alcoholInfo: AlcoholInfo;
  reviewInfo: Review;
  reviewImageList: {
    order: number;
    viewUrl: string;
  }[];
}

export type ReviewDetailsWithoutAlcoholInfo = Omit<
  ReviewDetailsApi,
  'alcoholInfo'
>;

export interface ReviewPostApi {
  callback: string;
  content: string;
  id: number;
}

export interface ReviewQueryParams {
  alcoholId?: string;
  content: string;
  status: string;
  sizeType: 'GLASS' | 'BOTTLE' | null;
  price?: number | null;
  tastingTagList?: string[] | null;
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

export interface ReviewPatchApi {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}

export interface ReviewLikePutApi {
  message: string;
  likedId: number;
  reviewId: number;
  userId: number;
  userNickName: string;
  status: 'LIKE' | 'DISLIKE';
}

export interface ReviewVisibilityPatchApi {
  codeMessage: string;
  message: string;
  reviewId: number;
  responseAt: string;
}

export interface KakaoPlace {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}
