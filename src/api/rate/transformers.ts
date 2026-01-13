// ============================================
// Rate API - Data Transformers
// ============================================

import type { RateApiRaw, RateAlcohol } from './types';

/**
 * 평점 API 응답의 카테고리명을 표준화합니다.
 * engCategoryName → engCategory, korCategoryName → korCategory
 */
export function transformRateItem(raw: RateApiRaw): RateAlcohol {
  return {
    alcoholId: raw.alcoholId,
    korName: raw.korName,
    engName: raw.engName,
    ratingCount: raw.ratingCount,
    engCategory: raw.engCategoryName,
    korCategory: raw.korCategoryName,
    imageUrl: raw.imageUrl,
    isPicked: raw.isPicked,
  };
}

/**
 * 평점 목록 API 응답을 변환합니다.
 */
export function transformRateList(rawList: RateApiRaw[]): RateAlcohol[] {
  return rawList.map(transformRateItem);
}
