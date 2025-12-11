export interface ProductImage {
  id: string | number;
  // src: string;
  alt: string;
}

export const BANNER_IMAGES: ProductImage[] = [
  {
    id: 'winterRecommend',
    // src: '/bannerImg/winter-banner.webp',
    alt: '겨울 추천 위스키 배너',
  },
  {
    id: 'bottleNote',
    // src: '/bannerImg/bottleNote-banner.png',
    alt: 'bottleNote 배너',
  },
  {
    id: 'rainDayRecommend',
    // src: '/bannerImg/rain-banner.png',
    alt: '비오는 날 추천 위스키 배너',
  },
];

export const TOP_MENU_ITEMS = [
  { id: 'week', name: 'HOT 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];
