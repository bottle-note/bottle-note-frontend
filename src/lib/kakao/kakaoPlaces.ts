/**
 * 카카오 지도 SDK의 장소 키워드 검색.
 * 로그인·공유에 쓰는 카카오 JS SDK(kakaoSDK.ts, window.Kakao)와는 다른 스크립트(window.kakao.maps)다.
 */

import type { KakaoPlace } from '@/types/Review';

const MAPS_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&autoload=false&libraries=services`;

let mapsReady: Promise<void> | null = null;

/** 카카오 지도 SDK를 한 번만 불러온다. 실패하면 다음 호출에서 다시 불러온다. */
export function loadKakaoMapsSDK(): Promise<void> {
  mapsReady ??= new Promise<void>((resolve, reject) => {
    const fail = (script?: HTMLScriptElement) => {
      mapsReady = null;
      script?.remove();
      reject(new Error('KAKAO_MAPS_SDK_LOAD_FAILED'));
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
    script.src = MAPS_SDK_URL;
    script.async = true;
    script.onload = () => init(script);
    script.onerror = () => fail(script);
    document.head.appendChild(script);
  });
  return mapsReady;
}

export interface KakaoPlacePage {
  places: KakaoPlace[];
  hasNextPage: boolean;
}

/** 키워드로 장소를 찾는다. 결과가 없으면 빈 목록, 검색 오류면 reject한다. 한 페이지는 15곳이다. */
export async function searchKakaoPlaces(
  keyword: string,
  page = 1,
): Promise<KakaoPlacePage> {
  await loadKakaoMapsSDK();
  const { Places, Status } = window.kakao.maps.services;
  return new Promise((resolve, reject) => {
    new Places().keywordSearch(
      keyword,
      (
        data: KakaoPlace[],
        status: string,
        pagination: { hasNextPage: boolean },
      ) => {
        if (status === Status.OK) {
          resolve({ places: data, hasNextPage: pagination.hasNextPage });
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

/** 리뷰 locationInfo로 보내는 장소 정보 */
export interface PlaceLocation {
  name: string;
  address: string;
  category: string | null;
  mapUrl: string | null;
  latitude: string | null;
  longitude: string | null;
}

export function toPlaceLocation(place: KakaoPlace): PlaceLocation {
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
