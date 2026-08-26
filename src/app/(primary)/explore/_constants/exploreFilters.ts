export const EXPLORE_RATING_PRESETS = [
  {
    id: 'EXACT_5_0',
    label: '5.0점',
    ratingFrom: 5,
    ratingTo: 5,
  },
  {
    id: 'AT_LEAST_4_5',
    label: '4.5점 이상',
    ratingFrom: 4.5,
    ratingTo: 5,
  },
  {
    id: 'AT_LEAST_4_0',
    label: '4.0점 이상',
    ratingFrom: 4,
    ratingTo: 5,
  },
  {
    id: 'AT_LEAST_3_5',
    label: '3.5점 이상',
    ratingFrom: 3.5,
    ratingTo: 5,
  },
  {
    id: 'AT_LEAST_3_0',
    label: '3.0점 이상',
    ratingFrom: 3,
    ratingTo: 5,
  },
  {
    id: 'AT_MOST_2_5',
    label: '2.5점 이하',
    ratingFrom: 0.5,
    ratingTo: 2.5,
  },
] as const;

export type ExploreRatingPreset = (typeof EXPLORE_RATING_PRESETS)[number];
export type ExploreRatingPresetId = ExploreRatingPreset['id'];

export const getExploreRatingPreset = (
  value: string | null,
): ExploreRatingPreset | undefined =>
  EXPLORE_RATING_PRESETS.find((preset) => preset.id === value);
