import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import type {
  CurationAlcohol,
  CurationV2DetailItem,
  ProgramPayload,
  TastingEventPayload,
} from '@/api/curation-v2/types';

/**
 * v2 큐레이션 상세 payload에서 검색 결과로 표시할 주류 라인업을 추출합니다.
 * 각 스펙이 선언한 payload 구조만 사용하며, 별도 v1 주류 목록을 요청하지 않습니다.
 */
export const getCurationAlcohols = (
  curation: CurationV2DetailItem,
): CurationAlcohol[] => {
  switch (curation.spec?.code) {
    case CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT:
      return (curation.payload as TastingEventPayload).alcohols ?? [];
    case CURATION_V2_SPEC_CODES.PROGRAM:
      return ((curation.payload as ProgramPayload).programs ?? []).flatMap(
        (item) => item.whiskies ?? [],
      );
    case CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY:
    case CURATION_V2_SPEC_CODES.WHISKY_PAIRING:
      return curation.payload as CurationAlcohol[];
    default:
      return [];
  }
};
