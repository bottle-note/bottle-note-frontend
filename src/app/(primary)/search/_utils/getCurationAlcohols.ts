import {
  programPayloadSchema,
  recommendedWhiskyPayloadSchema,
  tastingEventPayloadSchema,
} from '@/api/curation-v2/schema';
import type {
  CurationAlcohol,
  CurationV2DetailItem,
} from '@/api/curation-v2/types';

/**
 * v2 큐레이션 상세 payload에서 검색 결과로 표시할 주류 라인업을 추출합니다.
 * 각 스펙이 선언한 payload 구조만 사용하며, 별도 v1 주류 목록을 요청하지 않습니다.
 */
export const getCurationAlcohols = (
  curation: CurationV2DetailItem,
): CurationAlcohol[] => {
  const recommendedWhiskies = recommendedWhiskyPayloadSchema.safeParse(
    curation.payload,
  );
  if (recommendedWhiskies.success) {
    return recommendedWhiskies.data;
  }

  const tastingEvent = tastingEventPayloadSchema.safeParse(curation.payload);
  if (tastingEvent.success) {
    return tastingEvent.data.alcohols ?? [];
  }

  const program = programPayloadSchema.safeParse(curation.payload);
  if (program.success) {
    return program.data.programs.flatMap((item) => item.whiskies ?? []);
  }

  return [];
};
