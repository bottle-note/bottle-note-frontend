import type { ApiResponse } from '@/api/_shared/types';
import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import type {
  CurationV2FeedData,
  CurationV2FeedItem,
} from '@/api/curation-v2/types';
import { SSR_CALLER_HEADER } from '@/constants/common';
import {
  getInternalServerOrigin,
  internalApiHeaders,
} from '@/shared/api/internalApi';

export interface HomeCuration extends CurationV2FeedItem {
  specCode: CurationV2SpecCode;
}

// 날짜가 정해진 행사를 먼저 보여준다. 같은 종류 안에서는 서버 순서를 따른다.
export const HOME_CURATION_CODES: readonly CurationV2SpecCode[] = [
  CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  CURATION_V2_SPEC_CODES.PROGRAM,
  CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
  CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
];
// 네 종류가 모두 보이도록 종류마다 같은 수만 받는다.
const SIZE_PER_CODE = 2;
const REVALIDATE_SECONDS = 60 * 60;

/**
 * 피드 응답에는 항목의 spec이 없어서, 종류별로 따로 요청해 요청한 코드로 종류를 붙인다.
 * 한 종류가 실패해도 나머지는 보여준다.
 */
async function fetchFeed(code: CurationV2SpecCode): Promise<HomeCuration[]> {
  try {
    const query = new URLSearchParams({ code, size: String(SIZE_PER_CODE) });
    const res = await fetch(
      `${getInternalServerOrigin()}/api/v2/curations/feed?${query}`,
      {
        headers: internalApiHeaders({ ...SSR_CALLER_HEADER }),
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return [];

    const json: ApiResponse<CurationV2FeedData> = await res.json();
    return (json.data?.items ?? []).map((item) => ({
      ...item,
      specCode: code,
    }));
  } catch {
    return [];
  }
}

export async function getHomeCurations(): Promise<HomeCuration[]> {
  const feeds = await Promise.all(HOME_CURATION_CODES.map(fetchFeed));
  return feeds.flat();
}
