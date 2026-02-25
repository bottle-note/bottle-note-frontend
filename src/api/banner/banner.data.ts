import type { Banner } from './types';

/**
 * API 실패 시 사용되는 fallback 배너 데이터
 * 기존 하드코딩된 배너를 Banner 타입으로 변환
 */
export const FALLBACK_BANNERS: Banner[] = [
  {
    id: -1,
    name: '차가운 겨울밤,\n가장 따뜻한 한 모금',
    nameFontColor: '#FFFFFF',
    descriptionA: '',
    descriptionB: '겨울 추천 위스키 >',
    descriptionFontColor: '#FFFFFF',
    imageUrl: '/bannerImg/winter-banner.webp',
    textPosition: 'LT',
    targetUrl: '/search?keyword=겨울 추천 위스키',
    isExternalUrl: false,
    bannerType: 'CURATION',
    sortOrder: 1,
    startDate: null,
    endDate: null,
  },
  {
    id: -2,
    name: '기억에 남는 첫 향,\n보틀노트에서',
    nameFontColor: '#FFFFFF',
    descriptionA: '',
    descriptionB: '둘러보기',
    descriptionFontColor: '#9CA3AF',
    imageUrl: '/bannerImg/bottleNote-banner.webp',
    textPosition: 'LT',
    targetUrl: '/explore',
    isExternalUrl: false,
    bannerType: 'CURATION',
    sortOrder: 2,
    startDate: null,
    endDate: null,
  },
  {
    id: -3,
    name: '비오는 날은 피트!\n보틀노트가 추천하는',
    nameFontColor: '#FFFFFF',
    descriptionA: '비 오는 날 추천 위스키 >',
    descriptionB: '',
    descriptionFontColor: '#FFFFFF',
    imageUrl: '/bannerImg/rain-banner.webp',
    textPosition: 'LB',
    targetUrl: '/search?keyword=비 오는 날 추천 위스키',
    isExternalUrl: false,
    bannerType: 'CURATION',
    sortOrder: 3,
    startDate: null,
    endDate: null,
  },
];
