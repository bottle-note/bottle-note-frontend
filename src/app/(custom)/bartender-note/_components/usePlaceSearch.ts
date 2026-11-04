import { useInfiniteQuery } from '@tanstack/react-query';
import type { KakaoPlace } from '@/types/Review';
import type { ReviewPlace } from './types';

const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&autoload=false&libraries=services`;

let sdkReady: Promise<void> | null = null;

/** Kakao 지도 SDK를 한 번만 불러온다. 실패하면 다음 검색에서 다시 시도한다. */
function loadKakaoSdk() {
  sdkReady ??= new Promise<void>((resolve, reject) => {
    const fail = (script?: HTMLScriptElement) => {
      sdkReady = null;
      script?.remove();
      reject(new Error('KAKAO_SDK_LOAD_FAILED'));
    };
    // 등록되지 않은 도메인 등에서는 스크립트를 받아도 window.kakao.maps가 없다
    const init = (script?: HTMLScriptElement) => {
      try {
        window.kakao.maps.load(resolve);
      } catch {
        fail(script);
      }
    };
    if (window.kakao?.maps) {
      init();
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => init(script);
    script.onerror = () => fail(script);
    document.head.appendChild(script);
  });
  return sdkReady;
}

function toReviewPlace(place: KakaoPlace): ReviewPlace {
  return {
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    // "음식점 > 술집 > 칵테일바"처럼 오므로 마지막 분류만 쓴다
    category: place.category_name.split(' > ').pop() || null,
    mapUrl: place.place_url || null,
    latitude: place.y || null,
    longitude: place.x || null,
  };
}

interface PlacePage {
  places: ReviewPlace[];
  hasNextPage: boolean;
}

async function searchPlaces(keyword: string, page: number) {
  await loadKakaoSdk();
  const { Places, Status } = window.kakao.maps.services;
  return new Promise<PlacePage>((resolve, reject) => {
    new Places().keywordSearch(
      keyword,
      (
        data: KakaoPlace[],
        status: string,
        pagination: { hasNextPage: boolean },
      ) => {
        if (status === Status.OK) {
          resolve({
            places: data.map(toReviewPlace),
            hasNextPage: pagination.hasNextPage,
          });
        } else if (status === Status.ZERO_RESULT) {
          resolve({ places: [], hasNextPage: false });
        } else {
          reject(new Error('KAKAO_PLACE_SEARCH_FAILED'));
        }
      },
      { page },
    );
  });
}

/** Kakao 장소 키워드 검색. 한 번에 15곳씩, 더 보기로 다음 페이지를 붙인다. */
export function usePlaceSearch(keyword: string) {
  return useInfiniteQuery({
    queryKey: ['bartender-note', 'place-search', keyword],
    queryFn: ({ pageParam }) => searchPlaces(keyword, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.hasNextPage ? pages.length + 1 : undefined,
    enabled: keyword.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
