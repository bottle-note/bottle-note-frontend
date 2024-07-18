export interface Review {
  userId: number;
  imageUrl: null | string; // 다음주 server 확인 예정
  nickName: string;
  reviewId: number;
  reviewContent: string;
  rating: number;
  sizeType: string; // "BOTTLE", "GLASS"
  price: number;
  viewCount: number;
  likeCount: number;
  isMyLike: boolean;
  replyCount: number;
  isMyReply: boolean;
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

export interface ReviewDetailsApi {
  alcoholInfo: {
    alcoholId: number;
    korName: string;
    engName: string;
    korCategoryName: string;
    engCategoryName: string;
    imageUrl: string;
    isPicked: boolean;
  };
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
    reviewTastingTag: string[];
  };
  reviewImageList: [
    {
      order: number;
      viewUrl: string;
    },
  ];
  reviewReplyList: [
    {
      userId: number;
      imageUrl: string;
      nickName: string;
      reviewReplyId: number;
      reviewReplyContent: string;
      createAt: string;
    },
  ];
}

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
