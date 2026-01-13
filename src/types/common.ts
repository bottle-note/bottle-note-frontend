import { CATEGORY_MENUS, REGIONS } from '@/constants/common';

// 상수 기반 유틸리티 타입 (API 관련 타입은 @/api/_shared/types 참조)
export type Category =
  | (typeof CATEGORY_MENUS)[keyof typeof CATEGORY_MENUS]['categoryGroup']
  | '';
export type RegionId = (typeof REGIONS)[number]['regionId'];
