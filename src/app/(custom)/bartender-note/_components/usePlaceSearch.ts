import { useInfiniteQuery } from '@tanstack/react-query';
import { searchKakaoPlaces, toPlaceLocation } from '@/lib/kakao/kakaoPlaces';

/** Kakao 장소 키워드 검색. 한 번에 15곳씩, 더 보기로 다음 페이지를 붙인다. */
export function usePlaceSearch(keyword: string) {
  return useInfiniteQuery({
    queryKey: ['bartender-note', 'place-search', keyword],
    queryFn: async ({ pageParam }) => {
      const page = await searchKakaoPlaces(keyword, pageParam);
      return { ...page, places: page.places.map(toPlaceLocation) };
    },
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.hasNextPage ? pages.length + 1 : undefined,
    enabled: keyword.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
