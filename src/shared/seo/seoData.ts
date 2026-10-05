import { cache } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { ReviewApi } from '@/api/review/review.api';
import { UserApi } from '@/api/user/user.api';

/**
 * 메타데이터용 조회의 캐시 수명(초)과 태그.
 * 비로그인 공개 데이터만 캐시한다. 일부 상세 페이지는 초기 본문과 메타데이터가 공유한다.
 * - 리뷰: 비공개 전환·삭제 직후 본문이 메타·JSON-LD에 남지 않도록 캐시하지 않는다(0).
 * - 보틀: 정보·별점 변화가 느려 하루 지연을 허용한다. 응답의 리뷰 본문은 출력에 쓰지 않는다.
 * - 큐레이션: 노출 종료 후 오래된 본문이 남는 시간을 줄이기 위해 1시간만 캐시한다.
 * - 수입 신고: 표시 주류명이 매칭 확정으로 바뀔 수 있어 하루마다 갱신한다.
 * - 사용자: 공유 미리보기용 닉네임·기록 수.
 */
const ONE_DAY = 60 * 60 * 24;
const ONE_HOUR = 60 * 60;

export const SEO_CACHE_POLICY = {
  alcohol: { revalidate: ONE_DAY, tag: (id: string) => `alcohol:${id}` },
  review: { revalidate: 0, tag: (id: string) => `review:${id}` },
  curation: { revalidate: ONE_HOUR, tag: (id: string) => `curation:${id}` },
  // 수입 신고 원문은 안정적이지만 매칭 확정 시 화면에 표시하는 주류명이 바뀔 수 있다.
  importClearanceAlcohol: {
    revalidate: ONE_DAY,
    tag: (id: string) => `import-clearance-alcohol:${id}`,
  },
  user: { revalidate: 600, tag: (id: string) => `user:${id}` },
} as const;

const cacheOptions = (target: keyof typeof SEO_CACHE_POLICY, id: string) => ({
  revalidate: SEO_CACHE_POLICY[target].revalidate,
  tags: [SEO_CACHE_POLICY[target].tag(id)],
});

/** 같은 요청 안에서 메타데이터와 초기 본문이 한 번만 조회하도록 묶는다. */
export const getAlcoholSeoData = cache((id: string) =>
  AlcoholsApi.server.getAlcoholDetails(id, cacheOptions('alcohol', id)),
);

export const getReviewSeoData = cache((id: string) =>
  ReviewApi.server.getReviewDetails(id, cacheOptions('review', id)),
);

export const getCurationSeoData = cache((id: string) =>
  CurationV2Api.server.getDetail(id, cacheOptions('curation', id)),
);

export const getImportClearanceAlcoholSeoData = cache((id: string) =>
  MfdsApi.server.getAlcohol(id, cacheOptions('importClearanceAlcohol', id)),
);

export const getUserSeoData = cache((id: string) =>
  UserApi.server.getUserInfo(id, cacheOptions('user', id)),
);
