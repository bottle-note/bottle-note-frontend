import { cache } from 'react';
import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import { transformReviewAlcoholInfo } from '@/api/review/transformers';
import type {
  ReviewAlcoholInfoRaw,
  ReviewDetailsResponse,
} from '@/api/review/types';
import type { UserInfo } from '@/api/user/types';
import { fetchProductApi, type SeoFetchResult } from './productApi';

/**
 * 메타데이터용 조회의 캐시 수명(초)과 태그.
 * 비로그인 공개 데이터만 캐시하며, 페이지 본문(클라이언트 조회)에는 영향이 없다.
 * - 리뷰: 비공개 전환·삭제가 메타에 오래 남지 않도록 짧게 둔다.
 * - 보틀: 별점·대표 리뷰가 바뀌는 주기를 고려한다.
 * - 큐레이션: 관리자 발행 콘텐츠라 변경이 드물다.
 */
export const SEO_CACHE_POLICY = {
  alcohol: { revalidate: 600, tag: (id: string) => `alcohol:${id}` },
  review: { revalidate: 300, tag: (id: string) => `review:${id}` },
  curation: { revalidate: 3600, tag: (id: string) => `curation:${id}` },
  user: { revalidate: 600, tag: (id: string) => `user:${id}` },
} as const;

/** 같은 요청 안에서 generateMetadata와 layout(JSON-LD)이 한 번만 조회하도록 묶는다. */
export const getAlcoholSeoData = cache(
  (id: string): Promise<SeoFetchResult<AlcoholDetailsResponse>> =>
    fetchProductApi<AlcoholDetailsResponse>(
      `/alcohols/${encodeURIComponent(id)}`,
      {
        revalidate: SEO_CACHE_POLICY.alcohol.revalidate,
        tags: [SEO_CACHE_POLICY.alcohol.tag(id)],
      },
    ),
);

export const getReviewSeoData = cache(
  async (id: string): Promise<SeoFetchResult<ReviewDetailsResponse>> => {
    const result = await fetchProductApi<
      Omit<ReviewDetailsResponse, 'alcoholInfo'> & {
        alcoholInfo: ReviewAlcoholInfoRaw;
      }
    >(`/reviews/detail/${encodeURIComponent(id)}`, {
      revalidate: SEO_CACHE_POLICY.review.revalidate,
      tags: [SEO_CACHE_POLICY.review.tag(id)],
    });

    if (result.status !== 'ok') return result;

    return {
      status: 'ok',
      data: {
        ...result.data,
        alcoholInfo: transformReviewAlcoholInfo(result.data.alcoholInfo),
      },
    };
  },
);

export const getCurationSeoData = cache(
  (id: string): Promise<SeoFetchResult<CurationV2DetailItem>> =>
    fetchProductApi<CurationV2DetailItem>(
      `/curations/${encodeURIComponent(id)}`,
      {
        version: 'v2',
        revalidate: SEO_CACHE_POLICY.curation.revalidate,
        tags: [SEO_CACHE_POLICY.curation.tag(id)],
      },
    ),
);

export const getUserSeoData = cache(
  (id: string): Promise<SeoFetchResult<UserInfo>> =>
    fetchProductApi<UserInfo>(`/my-page/${encodeURIComponent(id)}`, {
      revalidate: SEO_CACHE_POLICY.user.revalidate,
      tags: [SEO_CACHE_POLICY.user.tag(id)],
    }),
);
