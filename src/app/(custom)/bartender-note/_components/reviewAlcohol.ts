import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import type { Whiskey } from '../_data/demo';

/** 바텐더 내부 상세·리뷰에서 공유하는 표시용 정보. API에 없는 가격은 보충하지 않는다. */
export interface ReviewAlcohol {
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
  reviewCount?: number;
}

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
