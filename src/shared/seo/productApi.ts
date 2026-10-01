import type { ApiResponse } from '@/api/_shared/types';
import { SSR_CALLER_HEADER } from '@/constants/common';
import {
  getInternalServerOrigin,
  internalApiHeaders,
} from '@/shared/api/internalApi';

export type SeoFetchResult<T> =
  | { status: 'ok'; data: T }
  // 대상이 없다. 검색엔진에 색인되지 않게 noindex 처리한다.
  | { status: 'not-found' }
  // 서버 장애 등 일시적 실패. 색인을 막지 않고 기본 메타로 응답한다.
  | { status: 'error' };

interface SeoFetchOptions {
  version?: 'v1' | 'v2';
  revalidate: number;
  tags: string[];
}

function isNotFound(status: number, body: ApiResponse<unknown> | null) {
  if (status === 404) return true;
  return (
    body?.errors?.some((error) => error.code.endsWith('_NOT_FOUND')) ?? false
  );
}

/**
 * 메타데이터·JSON-LD 생성용 비로그인 product-api 조회.
 * 200 응답만 Next 데이터 캐시에 저장되므로 실패는 캐시되지 않는다.
 */
export async function fetchProductApi<T>(
  path: string,
  { version = 'v1', revalidate, tags }: SeoFetchOptions,
): Promise<SeoFetchResult<T>> {
  try {
    const response = await fetch(
      `${getInternalServerOrigin()}/api/${version}${path}`,
      {
        method: 'GET',
        headers: internalApiHeaders({
          'Content-Type': 'application/json',
          ...SSR_CALLER_HEADER,
        }),
        next: { revalidate, tags },
      },
    );

    const body = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;

    if (isNotFound(response.status, body)) return { status: 'not-found' };
    if (!response.ok || !body || body.errors.length !== 0) {
      return { status: 'error' };
    }

    return { status: 'ok', data: body.data };
  } catch (error) {
    console.error(`[SEO] product-api ${path} 조회 실패:`, error);
    return { status: 'error' };
  }
}
