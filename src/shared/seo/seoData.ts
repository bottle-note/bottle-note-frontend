import { cache } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import { ReviewApi } from '@/api/review/review.api';
import { UserApi } from '@/api/user/user.api';

/**
 * 메타데이터용 조회의 캐시 수명(초)과 태그.
 * 비로그인 공개 데이터만 캐시하며, 페이지 본문(클라이언트 조회)에는 영향이 없다.
 * - 리뷰: 비공개 전환·삭제 직후 본문이 메타·JSON-LD에 남지 않도록 캐시하지 않는다(0).
 * - 보틀: 정보·별점 변화가 느려 하루 지연을 허용한다. 응답의 리뷰 본문은 출력에 쓰지 않는다.
 * - 큐레이션: 관리자 발행 콘텐츠라 하루 지연을 허용한다. 노출 종료 후에도 최대 하루 메타가 남을 수 있다.
 * - 사용자: 공유 미리보기용 닉네임·기록 수.
 */
const ONE_DAY = 60 * 60 * 24;

export const SEO_CACHE_POLICY = {
  alcohol: { revalidate: ONE_DAY, tag: (id: string) => `alcohol:${id}` },
  review: { revalidate: 0, tag: (id: string) => `review:${id}` },
  curation: { revalidate: ONE_DAY, tag: (id: string) => `curation:${id}` },
  user: { revalidate: 600, tag: (id: string) => `user:${id}` },
} as const;

const cacheOptions = (target: keyof typeof SEO_CACHE_POLICY, id: string) => ({
  revalidate: SEO_CACHE_POLICY[target].revalidate,
  tags: [SEO_CACHE_POLICY[target].tag(id)],
});

/** 같은 요청 안에서 generateMetadata와 layout(JSON-LD)이 한 번만 조회하도록 묶는다. */
export const getAlcoholSeoData = cache((id: string) =>
  AlcoholsApi.server.getAlcoholDetails(id, cacheOptions('alcohol', id)),
);

export const getReviewSeoData = cache((id: string) =>
  ReviewApi.server.getReviewDetails(id, cacheOptions('review', id)),
);

export const getCurationSeoData = cache((id: string) =>
  CurationV2Api.server.getDetail(id, cacheOptions('curation', id)),
);

export const getUserSeoData = cache((id: string) =>
  UserApi.server.getUserInfo(id, cacheOptions('user', id)),
);
