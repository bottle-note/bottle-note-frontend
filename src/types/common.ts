import { CATEGORY_MENUS, REGIONS } from '@/constants/common';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  errors: ErrorResponse[];
  meta: {
    serverEncoding: string;
    serverVersion: string;
    serverPathVersion: string;
    serverResponseTime: string;
    pageable?: { pageSize: number; hasNext: boolean; currentCursor: number };
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: string; // NOTE: 정확히 어떤 status가 존재하는지 알면 더 좋겠다.
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
  LATEST = 'LATEST',
}

export const enum SORT_ORDER {
  DESC = 'DESC',
  ASC = 'ASC',
}

export interface BaseListQueryParams {
  keyword?: string;
  cursor?: number;
  pageSize?: number;
}

export interface ListQueryParams extends BaseListQueryParams {
  category?: string;
  alcoholId?: string;
  reviewId?: string;
  rootReplyId?: string;
  regionId?: number | '';
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
}

export type Category =
  | (typeof CATEGORY_MENUS)[keyof typeof CATEGORY_MENUS]['categoryGroup']
  | '';
export type RegionId = (typeof REGIONS)[number]['regionId'];
