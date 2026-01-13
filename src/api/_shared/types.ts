// ============================================
// API 공통 타입 정의
// ============================================

// --------------- Response Types ---------------

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
    pageable?: PageableInfo;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: string;
}

export interface PageableInfo {
  pageSize: number;
  hasNext: boolean;
  currentCursor: number;
}

// --------------- Query Parameter Types ---------------

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

// --------------- Enums ---------------

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
