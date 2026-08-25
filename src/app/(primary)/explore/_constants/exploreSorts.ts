import type {
  ExploreSortOrder,
  ExploreSortType,
  ReviewExploreSortType,
} from '@/api/explore/types';

export interface ExploreSortPreset<
  TSortType extends string = ExploreSortType | ReviewExploreSortType,
> {
  id: string;
  label: string;
  sortType: TSortType;
  sortOrder: ExploreSortOrder;
}

export const WHISKEY_EXPLORE_SORT_PRESETS = [
  {
    id: 'POPULAR_DESC',
    label: '인기순',
    sortType: 'POPULAR',
    sortOrder: 'DESC',
  },
  {
    id: 'RATING_DESC',
    label: '별점 높은순',
    sortType: 'RATING',
    sortOrder: 'DESC',
  },
  {
    id: 'PICK_DESC',
    label: '찜 많은순',
    sortType: 'PICK',
    sortOrder: 'DESC',
  },
  {
    id: 'REVIEW_DESC',
    label: '리뷰 많은순',
    sortType: 'REVIEW',
    sortOrder: 'DESC',
  },
  {
    id: 'RANDOM_DESC',
    label: '랜덤',
    sortType: 'RANDOM',
    sortOrder: 'DESC',
  },
] as const satisfies readonly ExploreSortPreset<ExploreSortType>[];

export const REVIEW_EXPLORE_SORT_PRESETS = [
  {
    id: 'LATEST_DESC',
    label: '최신순',
    sortType: 'LATEST',
    sortOrder: 'DESC',
  },
  {
    id: 'LATEST_ASC',
    label: '오래된순',
    sortType: 'LATEST',
    sortOrder: 'ASC',
  },
  {
    id: 'POPULAR_DESC',
    label: '인기순',
    sortType: 'POPULAR',
    sortOrder: 'DESC',
  },
  {
    id: 'LIKES_DESC',
    label: '좋아요 많은순',
    sortType: 'LIKES',
    sortOrder: 'DESC',
  },
  {
    id: 'RATING_DESC',
    label: '별점 높은순',
    sortType: 'RATING',
    sortOrder: 'DESC',
  },
  {
    id: 'RATING_ASC',
    label: '별점 낮은순',
    sortType: 'RATING',
    sortOrder: 'ASC',
  },
  {
    id: 'BOTTLE_PRICE_ASC',
    label: '보틀 가격 낮은순',
    sortType: 'BOTTLE_PRICE',
    sortOrder: 'ASC',
  },
  {
    id: 'BOTTLE_PRICE_DESC',
    label: '보틀 가격 높은순',
    sortType: 'BOTTLE_PRICE',
    sortOrder: 'DESC',
  },
  {
    id: 'GLASS_PRICE_ASC',
    label: '잔 가격 낮은순',
    sortType: 'GLASS_PRICE',
    sortOrder: 'ASC',
  },
  {
    id: 'GLASS_PRICE_DESC',
    label: '잔 가격 높은순',
    sortType: 'GLASS_PRICE',
    sortOrder: 'DESC',
  },
] as const satisfies readonly ExploreSortPreset<ReviewExploreSortType>[];

export type WhiskeyExploreSortPreset =
  (typeof WHISKEY_EXPLORE_SORT_PRESETS)[number];
export type ReviewExploreSortPreset =
  (typeof REVIEW_EXPLORE_SORT_PRESETS)[number];

export const DEFAULT_WHISKEY_EXPLORE_SORT =
  WHISKEY_EXPLORE_SORT_PRESETS[WHISKEY_EXPLORE_SORT_PRESETS.length - 1];
export const DEFAULT_REVIEW_EXPLORE_SORT = REVIEW_EXPLORE_SORT_PRESETS[0];
