export type Step =
  | 'intro'
  | 'scenario'
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
