import type { CurationV2FeedItem } from './types';

export type CurationFeedKind = 'curation' | 'pairing' | 'program' | 'tasting';

export const CURATION_FEED_KIND_LABEL: Record<CurationFeedKind, string> = {
  curation: '큐레이션',
  pairing: '페어링',
  program: '프로그램',
  tasting: '시음회',
};

/**
 * 피드 항목에는 spec 코드가 없어서 payload 모양으로 종류를 가른다.
 * 페어링은 항목마다 pairings 배열을, 프로그램은 행사 기간 객체를, 시음회는 행사일·정원 객체를 가진다.
 */
export const getCurationFeedKind = (
  item: CurationV2FeedItem,
): CurationFeedKind => {
  const { payload } = item;

  if (Array.isArray(payload)) {
    const hasPairings = payload.some(
      (payloadItem) =>
        typeof payloadItem === 'object' &&
        payloadItem !== null &&
        'pairings' in payloadItem,
    );
    return hasPairings ? 'pairing' : 'curation';
  }

  if (payload && typeof payload === 'object' && 'eventStartDate' in payload) {
    return 'program';
  }

  if (payload && typeof payload === 'object' && 'eventDate' in payload) {
    return 'tasting';
  }

  return 'curation';
};
