import { ProductImage } from '@/app/(primary)/_components/MainCarousel';

export const BANNER_IMAGES: ProductImage[] = [
  {
    id: 'bottleNote',
    src: '/bannerImg/bottleNote-banner.png',
    alt: 'bottleNote 배너',
  },
  {
    id: 'summerRecommend',
    src: '/bannerImg/summer-banner.png',
    alt: '여름 추천 위스키 배너',
  },
  {
    id: 'rainDayRecommend',
    src: '/bannerImg/rain-banner.png',
    alt: '비오는 날 추천 위스키 배너',
  },
];

export const TOP_MENU_ITEMS = [
  { id: 'week', name: 'HOT 5' },
  { id: 'recent', name: '최근에 본 위스키' },
];

export const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];
