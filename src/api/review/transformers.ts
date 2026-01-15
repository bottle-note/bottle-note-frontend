// ============================================
// Review API - Data Transformers
// ============================================

import type { ReviewAlcoholInfoRaw, ReviewAlcoholInfo } from './types';

/**
 * 리뷰 상세의 alcoholInfo 카테고리명을 표준화합니다.
 * engCategoryName → engCategory, korCategoryName → korCategory
 */
export function transformReviewAlcoholInfo(
  raw: ReviewAlcoholInfoRaw,
): ReviewAlcoholInfo {
  return {
    alcoholId: raw.alcoholId,
    korName: raw.korName,
    engName: raw.engName,
    korCategory: raw.korCategoryName ?? raw.korCategory ?? '',
    engCategory: raw.engCategoryName ?? raw.engCategory ?? '',
    imageUrl: raw.imageUrl,
    isPicked: raw.isPicked,
    rating: raw.rating,
    totalRatingsCount: raw.totalRatingsCount,
  };
}
