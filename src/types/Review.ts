export interface Review {
  userId: number;
  userProfileImage?: null | string;
  nickName: string;
  reviewId: number;
  reviewContent: string;
  rating: number;
  sizeType: 'BOTTLE' | 'GLASS';
  price: number;
  likeCount: number;
  isLikedByMe: boolean;
  replyCount: number;
  isMyReview?: boolean;
  isBestReview?: boolean;
  hasReplyByMe: boolean;
  status: 'PUBLIC' | 'PRIVATE';
  reviewImageUrl: null | string;
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
  zipCode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
}

export interface ReviewListApi {
  reviewList: Review[];
  totalCount: number;
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

export interface ReviewDetailsApi {
  alcoholInfo: AlcoholInfo;
  reviewResponse: {
    reviewId: number;
    reviewContent: string;
    price: number;
    sizeType: 'GLASS' | 'BOTTLE';
    likeCount: number;
    replyCount: number;
    reviewImageUrl: string;
    createAt: string;
    userId: number;
    nickName: string;
    userProfileImage: string;
    rating: number;
    zipCode: string | null;
    address: string | null;
    detailAddress: string | null;
    status: 'PUBLIC' | 'PRIVATE';
    isMyReview: boolean;
    isLikedByMe: boolean;
    hasReplyByMe: boolean;
    isBestReview: boolean;
    reviewTastingTag: string[];
  };
  reviewImageList: {
    order: number;
    viewUrl: string;
  }[];
  // 최근 변경된 사항으로 댓글 구현 시 수정 예정
  // reviewReplyList: [
  //   {
  //     userId: number;
  //     imageUrl: string;
  //     nickName: string;
  //     reviewReplyId: number;
  //     reviewReplyContent: string;
  //     createAt: string;
  //   },
  // ];
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
    zipCode?: string | null;
    address?: string | null;
    detailAddress?: string | null;
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
