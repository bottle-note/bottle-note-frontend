import { CATEGORY_MENUS, REGIONS } from '@/constants/common';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  errors: any;
  meta: {
    serverEncoding: string;
    serverVersion: string;
    serverPathVersion: string;
    serverResponseTime: string;
    pageable?: { pageSize: number; hasNext: boolean; currentCursor: number };
  };
}

export const enum SORT_TYPE {
  POPULAR = 'POPULAR',
  RATING = 'RATING',
  PICK = 'PICK',
  REVIEW = 'REVIEW',
  RANDOM = 'RANDOM',
}

export const enum SORT_ORDER {
  DESC = 'DESC',
  ASC = 'ASC',
}

export interface ListQueryParams {
  keyword?: string;
  category?: string;
  regionId?: number | '';
  sortType?: SORT_TYPE;
  sortOrder?: SORT_ORDER;
  cursor?: number;
  pageSize?: number;
}

export type Category =
  (typeof CATEGORY_MENUS)[keyof typeof CATEGORY_MENUS]['categoryGroup'];
export type RegionId = (typeof REGIONS)[number]['regionId'];
