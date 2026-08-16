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
    pagination?: PaginationMeta;
    searchParameters?: Record<string, unknown>;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: string;
}

export interface PaginationMeta {
  hasNext: boolean;
  nextCursor: string | null;
}

// --------------- Query Parameter Types ---------------

export interface InfiniteListParams {
  cursor?: string;
  size?: number;
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
