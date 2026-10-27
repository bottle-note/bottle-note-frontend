export type Step =
  | 'intro'
  | 'scenario'
  /** 추천 결과의 1위를 먼저 건네는 단계. 상세와 같은 화면이고, 나머지 후보는 recommendations에서 본다. */
  | 'first-pick'
  | 'recommendations'
  | 'situation'
  | 'curations'
  | 'curation-empty'
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
  | 'review-preview'
  | 'review-done';

export interface AlcoholSelection {
  id: number;
  source: 'api' | 'demo';
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
  place: string;
  unit: 'glass' | 'bottle';
  price: string;
  public: boolean;
};

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
  place: '',
  unit: 'glass',
  price: '',
  public: true,
};
