import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';

export interface HomeEditorPick extends CurationV2FeedItem {
  specCode: CurationV2SpecCode;
}

// 날짜가 정해진 행사를 먼저 보여준다. 같은 종류 안에서는 서버 순서를 따른다.
export const EDITOR_PICK_SPEC_CODES: readonly CurationV2SpecCode[] = [
  CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  CURATION_V2_SPEC_CODES.PROGRAM,
  CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
  CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
];
// 네 종류가 모두 보이도록 종류마다 같은 수만 받는다.
const SIZE_PER_CODE = 2;
const CACHE = { revalidate: 60 * 60, tags: ['home-editor-picks'] };

/**
 * 피드 응답에는 항목의 spec이 없어서, 종류별로 따로 요청해 요청한 코드로 종류를 붙인다.
 * 한 종류가 실패해도 나머지는 보여준다.
 */
async function fetchCurationFeedBySpec(
  code: CurationV2SpecCode,
): Promise<HomeEditorPick[]> {
  const result = await CurationV2Api.server.getFeed(
    { code: [code], size: SIZE_PER_CODE },
    CACHE,
  );
  if (result.status !== 'ok') return [];

  return result.data.items.map((item) => ({ ...item, specCode: code }));
}

export async function fetchHomeEditorPicks(): Promise<HomeEditorPick[]> {
  const feeds = await Promise.all(
    EDITOR_PICK_SPEC_CODES.map(fetchCurationFeedBySpec),
  );
  return feeds.flat();
}
