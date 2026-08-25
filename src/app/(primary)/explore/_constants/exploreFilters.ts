export const EXPLORE_RATING_VALUES = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
] as const;

export type ExploreRating = (typeof EXPLORE_RATING_VALUES)[number];

export const isExploreRating = (value: number): value is ExploreRating =>
  EXPLORE_RATING_VALUES.some((rating) => rating === value);
