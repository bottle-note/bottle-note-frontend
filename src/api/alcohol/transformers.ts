// ============================================
// Alcohol API - Data Transformers
// ============================================

import type {
  AlcoholApiRaw,
  Alcohol,
  CategoryResponse,
  RegionResponse,
} from './types';

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
export function transformRegions(regions: RegionResponse[]): RegionResponse[] {
  const filtered = regions.filter((r) => !r.korName.includes('-'));
  return [
    {
      regionId: 0,
      korName: '국가(전체)',
      engName: 'All',
      description: '',
      parentId: null,
    },
    ...filtered,
  ];
}

/**
 * RegionResponse[]를 OptionSelect 형태로 변환합니다.
 * regionId 0 (전체)은 빈 문자열로 매핑합니다.
 */
export function toRegionOptions(
  regions: RegionResponse[],
): { type: string; name: string }[] {
  return regions.map((r) => ({
    type: r.regionId === 0 ? '' : String(r.regionId),
    name: r.korName,
  }));
}
