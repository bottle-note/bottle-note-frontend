import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import type { Whiskey } from '../_data/demo';

/** 리뷰 흐름에서 쓰는 술 정보. 가격처럼 API에 없는 값은 표시하지 않는다. */
export type ReviewAlcohol = {
  id: number;
  name: string;
  category: string;
  region?: string;
  abv?: string;
  rating: number | null;
  ratingCount?: number;
  glassPrice?: number | null;
  bottlePrice?: number | null;
  tags: string[];
  description?: string;
  imageUrl?: string;
  demoWhiskey?: Whiskey;
};

export function reviewAlcoholFromWhiskey(whiskey: Whiskey): ReviewAlcohol {
  return {
    ...whiskey,
    abv: String(whiskey.abv),
    demoWhiskey: whiskey,
  };
}

export function reviewAlcoholFromDetails(
  details: AlcoholDetailsResponse,
): ReviewAlcohol {
  const alcohol = details.alcohols;
  return {
    id: alcohol.alcoholId,
    name: alcohol.korName,
    category: alcohol.korCategory,
    region: alcohol.korRegion,
    abv: alcohol.abv.replace(/%$/, '').trim() || undefined,
    rating: alcohol.totalRatingsCount > 0 ? alcohol.rating : null,
    ratingCount: alcohol.totalRatingsCount,
    tags: alcohol.alcoholsTastingTags ?? [],
    description: alcohol.description,
    imageUrl: alcohol.alcoholUrlImg,
  };
}
