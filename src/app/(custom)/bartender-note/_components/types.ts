export type Step =
  | 'intro'
  | 'level'
  | 'likes'
  | 'kind'
  | 'axis'
  | 'abv'
  | 'price'
  | 'recommendations'
  | 'similar'
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
  | 'review-done'
  | 'review-posted-detail';

export type Answers = {
  level: string;
  likedIds: number[];
  kind: string;
  axis: string;
  abv: string;
  unit: 'glass' | 'bottle';
  price: string;
};

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

export const initialAnswers: Answers = {
  level: '',
  likedIds: [],
  kind: '',
  axis: '',
  abv: '',
  unit: 'glass',
  price: '',
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
