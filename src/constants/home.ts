export interface ProductImage {
  id: string | number;
  src: string;
  alt: string;
  /** 가벼운 placeholder 이미지 (있으면 progressive 로딩 적용) */
  placeholderSrc?: string;
}

export const BANNER_IMAGES: ProductImage[] = [
  {
    id: 'winterRecommend',
    src: '/bannerImg/winter-banner.webp',
    alt: '겨울 추천 위스키 배너',
    placeholderSrc: '/bannerImg/winter-banner-poster.webp',
  },
  {
    id: 'bottleNote',
    src: '/bannerImg/bottleNote-banner.webp',
    alt: 'bottleNote 배너',
  },
  {
    id: 'rainDayRecommend',
    src: '/bannerImg/rain-banner.webp',
    alt: '비오는 날 추천 위스키 배너',
  },
];

export const TOP_MENU_ITEMS = [
  { id: 'week', name: 'HOT 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];
