import { Icons } from '@/app/(primary)/history/_components/filter/Icons';

const ratingValues = [
  '별점 전체',
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
];

export const RATINGS_FILTERS = ratingValues.map((name) => ({
  icon: Icons.Star,
  name,
}));

export const REVIEW_FILTERS = [
  {
    icon: Icons.Review,
    name: '리뷰 전체',
  },
  {
    name: '베스트 리뷰',
  },
  {
    name: '좋아요',
  },
  {
    name: '댓글',
  },
];

export const LIKE_FILTERS = [
  {
    icon: Icons.Like,
    name: '찜 전체',
  },
  {
    name: '찜 하기',
  },
  {
    name: '찜 해제',
  },
];
