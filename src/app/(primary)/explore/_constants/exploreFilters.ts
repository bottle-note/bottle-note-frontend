export const EXPLORE_RATING_VALUES = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
] as const;

export type ExploreRating = (typeof EXPLORE_RATING_VALUES)[number];

export interface ExploreRatingRange {
  ratingFrom: ExploreRating;
  ratingTo: ExploreRating;
}

const isExploreRating = (value: number): value is ExploreRating =>
  EXPLORE_RATING_VALUES.some((rating) => rating === value);

export const getExploreRatingRange = (
  ratingFromValue: string | null,
  ratingToValue: string | null,
): ExploreRatingRange | undefined => {
  if (ratingFromValue === null || ratingToValue === null) return undefined;

  const ratingFrom = Number(ratingFromValue);
  const ratingTo = Number(ratingToValue);

  if (
    !isExploreRating(ratingFrom) ||
    !isExploreRating(ratingTo) ||
    ratingFrom > ratingTo
  ) {
    return undefined;
  }

  return { ratingFrom, ratingTo };
};

export const formatExploreRating = (rating: ExploreRating) => rating.toFixed(1);
