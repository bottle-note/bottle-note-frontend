import { useQuery } from '@tanstack/react-query';
import { ExploreApi } from '@/api/explore/explore.api';
import type { Alcohol } from '@/api/alcohol/types';

/** 지금 보는 위스키가 결과에 섞여 오므로 하나 더 받아 두고 뺀다. */
const LIMIT = 10;

/**
 * 고른 테이스팅 태그를 모두 가진 위스키를 인기순으로 찾는다.
 * 둘러보기 검색어는 공백으로 나눈 토큰을 AND로 묶고 태그도 검색하므로,
 * 태그를 공백으로 이어 보내면 "모두 겹치는" 위스키만 온다.
 */
export function useSimilarAlcohols(alcoholId: number, tags: string[]) {
  const keyword = tags.join(' ');

  return useQuery({
    queryKey: ['alcohols', 'similar', alcoholId, keyword],
    queryFn: async ({ signal }) =>
      (
        await ExploreApi.getAlcohols({
          keyword,
          sortType: 'POPULAR',
          size: LIMIT + 1,
          signal,
        })
      ).data.items,
    select: (items): Alcohol[] =>
      items
        .filter((item) => item.alcoholId !== alcoholId)
        .slice(0, LIMIT)
        .map((item) => ({
          alcoholId: item.alcoholId,
          korName: item.korName,
          engName: item.engName,
          rating: item.rating,
          ratingCount: item.totalRatingsCount,
          korCategory: item.korCategory,
          engCategory: item.engCategory,
          imageUrl: item.alcoholUrlImg,
          isPicked: item.isPicked,
        })),
    enabled: tags.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
