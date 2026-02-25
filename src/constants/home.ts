export const MENU_CATEGORY = [{ id: 'category', name: '카테고리' }];

// HomeFeaturedConfig 타입 먼저 정의 (순서 의존성)
export const HOME_FEATURED_CONFIG = {
  'view-week': {
    titleLabel: '주간 조회수 TOP 5',
    titleText: ['이번 주 사람들이 가장 많이 본', '위스키를 확인해보세요🔥'],
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  week: {
    titleLabel: 'WEEKLY HOT 5',
    titleText: ['이번 주 사람들이 가장 많이 검색한', 'HOT5를 확인해보세요🔥'],
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  spring: {
    titleLabel: 'SPRING PICKS',
    titleText: ['봄에 어울리는 술', '봄바람처럼 부드러운 한 잔🌸'],
    emptyText: '데이터 준비 중 입니다.',
    requiresAuth: false,
  },
  recent: {
    titleLabel: 'VIEW HISTORY',
    titleText: ['{nickname} 님이', '최근 본 위스키에요🥃'],
    emptyText: '최근에 본 위스키가 없어요.',
    requiresAuth: true,
  },
} as const;

export type HomeFeaturedConfigKey = keyof typeof HOME_FEATURED_CONFIG;
