import { CATEGORY_MENUS, REGIONS } from '@/constants/common';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  errors: any; // FIXME: 백엔드 수정 후 에러 타입 추가
  meta: {
    serverEncoding: string;
    serverVersion: string;
    serverPathVersion: string;
    serverResponseTime: string;
    pageable?: { pageSize: number; hasNext: boolean; currentCursor: number };
  };
}

// TODO: 두 개의 sort type 으로 분리할 것 (리뷰, 위스키 조회 ...)
export const enum SORT_TYPE {
  POPULAR = 'POPULAR',
  RATING = 'RATING',
  PICK = 'PICK',
  REVIEW = 'REVIEW',
  RANDOM = 'RANDOM',
  BOTTLE_PRICE = 'BOTTLE_PRICE',
  GLASS_PRICE = 'GLASS_PRICE',
}

export const enum SORT_ORDER {
  DESC = 'DESC',
  ASC = 'ASC',
}

export interface ListQueryParams {
  keyword?: string;
  category?: string;
  alcoholId?: string;
  reviewId?: string;
  rootReplyId?: string;
  regionId?: number | '';
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
  cursor?: number;
  pageSize?: number;
}

export type Category =
  (typeof CATEGORY_MENUS)[keyof typeof CATEGORY_MENUS]['categoryGroup'];
export type RegionId = (typeof REGIONS)[number]['regionId'];
