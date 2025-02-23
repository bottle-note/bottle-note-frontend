import { Icons } from '@/app/(primary)/history/_components/filter/Icons';

export const RATING_NUM_VALUES = [
  '0.5',
  '1.0',
  '1.5',
  '2.0',
  '2.5',
  '3.0',
  '3.5',
  '4.0',
  '4.5',
  '5.0',
] as const;

export const RATINGS_FILTERS = [
  { icon: Icons.Star, name: '별점 전체', value: 'ALL' },
  ...RATING_NUM_VALUES.map((value) => ({
    icon: Icons.Star,
    name: value,
    value,
  })),
];

export const REVIEW_FILTERS = [
  {
    icon: Icons.Review,
    name: '리뷰 전체',
    value: 'ALL',
  },
  {
    name: '베스트 리뷰',
    value: 'BEST_REVIEW',
  },
  {
    name: '좋아요',
    value: 'REVIEW_LIKE',
  },
  {
    name: '댓글',
    value: 'REVIEW_REPLY',
  },
];

export const LIKE_FILTERS = [
  {
    icon: Icons.Like,
    name: '찜 전체',
    value: 'ALL',
  },
  {
    name: '찜 하기',
    value: 'PICK',
  },
  {
    name: '찜 해제',
    value: 'UNPICK',
  },
];

export const REVIEW_FILTER_TYPES = {
  ALL: 'ALL',
  BEST_REVIEW: 'BEST_REVIEW',
  REVIEW_LIKE: 'REVIEW_LIKE',
  REVIEW_REPLY: 'REVIEW_REPLY',
} as const;

export const PICKS_STATUS = {
  PICK: 'PICK',
  UNPICK: 'UNPICK',
} as const;
