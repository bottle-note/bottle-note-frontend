import type { AlcoholAPI } from '@/types/Alcohol';
import type { HomeFeaturedConfigKey } from '@/constants/home';

// HOME_FEATURED_CONFIG의 키 타입을 재사용하여 일관성 유지
export type HomeFeaturedType = HomeFeaturedConfigKey;

export type HomeFeaturedAlcoholItem = AlcoholAPI & { path: string };

export interface HomeFeaturedContentItem {
  title: string;
  line1: string;
  line2: string;
}

export const HOME_FEATURED_CONTENT: Record<
  HomeFeaturedType,
  HomeFeaturedContentItem
> = {
  week: {
    title: 'WEEKLY HOT 5',
    line1: '이번 주 사람들이 가장 많이 검색한',
    line2: 'HOT5를 확인해보세요🔥',
  },
  'view-week': {
    title: 'WEEKLY VIEW TOP 5',
    line1: '이번 주 가장 많이 조회된',
    line2: '위스키를 확인해보세요👀',
  },
  spring: {
    title: 'SPRING PICKS',
    line1: '봄에 어울리는 술',
    line2: '봄바람처럼 부드러운 한 잔🌸',
  },
  recent: {
    title: 'VIEW HISTORY',
    line1: '', // nickname으로 대체됨
    line2: '최근 본 위스키에요🥃',
  },
};
