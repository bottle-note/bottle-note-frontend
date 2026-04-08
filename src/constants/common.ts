export const CATEGORY_MENUS = {
  All: { kor: '전체', eng: 'All', link: 'all', categoryGroup: 'ALL' },
  SingleMalt: {
    kor: '싱글몰트',
    eng: 'Single malt',
    link: 'SINGLE_MALT',
    categoryGroup: 'SINGLE_MALT',
  },
  BlendedMalt: {
    kor: '블렌디드 몰트',
    eng: 'Blended malt',
    link: 'BLENDED_MALT',
    categoryGroup: 'BLENDED_MALT',
  },
  Blended: {
    kor: '블렌디드',
    eng: 'Blended',
    link: 'BLEND',
    categoryGroup: 'BLEND',
  },
  America: {
    kor: '아메리카(버번)',
    eng: 'America(Bourbon)',
    link: 'BOURBON',
    categoryGroup: 'BOURBON',
  },
  Rye: { kor: '라이', eng: 'Rye', link: 'RYE', categoryGroup: 'RYE' },
  Other: { kor: '기타', eng: 'Other', link: 'OTHER', categoryGroup: 'OTHER' },
} as const;

export const CATEGORY_MENUS_LIST = Object.values(CATEGORY_MENUS).map(
  (category) => ({
    id: category.categoryGroup,
    name: category.kor,
  }),
);

export const S3_URL_PATH = {
  review: 'review',
  userProfile: 'user/profile',
  inquire: 'inquire',
  tastingGraph: 'tasting-graph',
};

export const DEBOUNCE_DELAY = 2000;

export const LABEL_NAMES = {
  BEST: '베스트',
  MY_REVIEW: '나의 리뷰',
  HOT_5: 'HOT 5',
  REVIEW_AUTHOR: '리뷰 작성자',
  MY_RATING: '나의 별점',
} as const;

export const BASE_URL = 'https://bottle-note.com';
