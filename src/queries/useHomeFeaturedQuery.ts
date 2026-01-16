import { useQuery } from '@tanstack/react-query';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { Alcohol } from '@/api/alcohol/types';
import type { HomeFeaturedType } from '@/types/HomeFeatured';

// Query Key 팩토리
export const homeFeaturedKeys = {
  all: ['homeFeatured'] as const,
  type: (type: HomeFeaturedType) => [...homeFeaturedKeys.all, type] as const,
};

interface UseHomeFeaturedQueryOptions {
  type: HomeFeaturedType;
  enabled?: boolean;
}

/**
 * 홈 화면 피처드 위스키 목록을 조회하는 TanStack Query 훅
 *
 * - week: 주간 인기 위스키 (검색 기반)
 * - view-week: 주간 조회수 기반 인기 위스키
 * - spring: 봄 시즌 추천 위스키
 * - recent: 최근 본 위스키 (로그인 필요)
 */
export const useHomeFeaturedQuery = ({
  type,
  enabled = true,
}: UseHomeFeaturedQueryOptions) => {
  return useQuery({
    queryKey: homeFeaturedKeys.type(type),
    queryFn: async (): Promise<Alcohol[]> => {
      switch (type) {
        case 'week': {
          const response = await AlcoholsApi.getWeeklyPopular();
          return response.data.alcohols;
        }
        case 'view-week': {
          const response = await AlcoholsApi.getWeeklyViewPopular(5);
          return response.data.alcohols;
        }
        case 'spring': {
          const response = await AlcoholsApi.getSpringPopular();
          return response.data;
        }
        case 'recent': {
          const response = await AlcoholsApi.getHistory();
          return response.data.items;
        }
        default:
          return [];
      }
    },
    enabled,
    // recent는 항상 최신 데이터 필요, 나머지는 5분 캐시
    staleTime: type === 'recent' ? 0 : 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10, // 10분 GC
    retry: false,
  });
};
