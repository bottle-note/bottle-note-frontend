import type { PlaceLocation } from '@/lib/kakao/kakaoPlaces';

export type Step =
  | 'intro'
  | 'scenario'
  /** 추천 결과의 1위를 먼저 건네는 단계. 상세와 같은 화면이고, 나머지 후보는 recommendations에서 본다. */
  | 'first-pick'
  | 'recommendations'
  | 'curations'
  | 'curation-list'
  | 'favorites'
  | 'detail'
  | 'review-pick'
  | 'review-mode'
  | 'review-text'
  | 'review-nose'
  | 'review-palate'
  | 'review-finish'
  | 'review-graph'
  | 'review-photo'
  | 'review-rating'
  | 'review-where'
  /** 장소·가격 단계에서 장소 칸을 눌러 들어오는 검색. 고르면 장소·가격 단계로 돌아간다. */
  | 'review-place'
  | 'review-preview'
  | 'review-done';

export interface AlcoholSelection {
  id: number;
  source: 'api';
}

export type ReviewDraft = {
  mode: 'quick' | 'detail';
  text: string;
  nose: string;
  palate: string;
  finish: string;
  tasting: number[];
  tags: string[];
  excludedTags: string[];
  photos: File[];
  tastingAuto: boolean;
  rating: number;
  place: ReviewPlace | null;
  /** 가격 단위. 고르지 않으면 금액을 적을 수 없다. */
  unit: 'glass' | 'bottle' | null;
  price: string;
  public: boolean;
};

/** 장소 검색에서 고른 곳. 리뷰의 locationInfo로 그대로 보낸다. */
export type ReviewPlace = PlaceLocation;

export const initialReview: ReviewDraft = {
  mode: 'quick',
  text: '',
  nose: '',
  palate: '',
  finish: '',
  tasting: [0, 0, 0, 0, 0, 0],
  tags: [],
  excludedTags: [],
  photos: [],
  tastingAuto: false,
  rating: 0,
  place: null,
  unit: null,
  price: '',
  public: true,
};
