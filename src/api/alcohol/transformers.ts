// ============================================
// Alcohol API - Data Transformers
// ============================================

import type { AlcoholApiRaw, Alcohol, CategoryResponse } from './types';

/**
 * 위스키 API 응답의 카테고리명을 표준화하고 path를 생성합니다.
 */
export function transformAlcohol(raw: AlcoholApiRaw): Alcohol {
  const engCategory = raw.engCategoryName ?? raw.engCategory ?? '';
  const korCategory = raw.korCategoryName ?? raw.korCategory ?? '';

  return {
    alcoholId: raw.alcoholId,
    korName: raw.korName,
    engName: raw.engName,
    rating: raw.rating,
    ratingCount: raw.ratingCount,
    korCategory,
    engCategory,
    imageUrl: raw.imageUrl,
    isPicked: raw.isPicked,
    popularScore: raw.popularScore,
    path: `/search/${engCategory}/${raw.alcoholId}`,
  };
}

/**
 * 위스키 목록을 변환합니다.
 */
export function transformAlcoholList(rawList: AlcoholApiRaw[]): Alcohol[] {
  return rawList.map(transformAlcohol);
}

/**
 * 카테고리 목록에 '전체' 옵션을 추가하고, '버번'을 '아메리칸(버번)'으로 변환합니다.
 */
export function transformCategories(
  categories: CategoryResponse[],
): CategoryResponse[] {
  const transformed = categories.map((category) => {
    if (category.korCategory === '버번') {
      return { ...category, korCategory: '아메리칸(버번)' };
    }
    return category;
  });

  // '전체' 옵션 추가
  return [
    {
      korCategory: '전체',
      engCategory: 'All',
      categoryGroup: '',
    },
    ...transformed,
  ];
}

/**
 * 지역 목록에 '국가(전체)' 옵션을 추가합니다.
 */
export function transformRegions(
  regions: { regionId: number; korName: string }[],
): { id: number; value: string }[] {
  const transformed = regions.map((region) => ({
    id: region.regionId,
    value: region.korName,
  }));

  return [{ id: -1, value: '국가(전체)' }, ...transformed];
}
