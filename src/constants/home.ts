// HomeFeaturedConfig 타입 먼저 정의 (순서 의존성)
export const HOME_FEATURED_CONFIG = {
  'view-week': {
    label: 'WEEKLY TOP 5',
    title: '이번 주 사람들이 가장 많이 본 위스키',
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  week: {
    label: 'WEEKLY HOT 5',
    title: '이번 주 사람들이 가장 많이 검색한 HOT5',
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  spring: {
    label: 'SPRING PICKS',
    title: '봄바람처럼 부드러운 한 잔',
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  recent: {
    label: 'VIEW HISTORY',
    title: '내가 최근 본 위스키',
    emptyText: '최근에 본 위스키가 없어요.',
    requiresAuth: true,
  },
} as const;

export type HomeFeaturedConfigKey = keyof typeof HOME_FEATURED_CONFIG;
