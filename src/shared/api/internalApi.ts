import { SSR_CALLER_HEADER } from '@/constants/common';

function ticketFrom(raw: string | undefined): string | null {
  if (!raw) return null;

  try {
    return new URL(raw).searchParams.get('warpgate-ticket');
  } catch {
    return null;
  }
}

function getLocalWarpTicket(): string | null {
  return (
    ticketFrom(process.env.API_SERVER_WARP_URL) ??
    ticketFrom(process.env.INTERNAL_SERVER_URL)
  );
}

/** 로컬은 API_SERVER_WARP_URL origin, 클러스터는 INTERNAL_SERVER_URL origin. */
export function getInternalServerOrigin(): string {
  const raw =
    process.env.API_SERVER_WARP_URL || process.env.INTERNAL_SERVER_URL;
  if (!raw) {
    throw new Error('INTERNAL_SERVER_URL is required');
  }

  return new URL(raw).origin;
}

/** 서버에서 product-api 를 칠 때 쓰는 헤더. 로컬 티켓이 없으면 받은 헤더 그대로다. */
export function internalApiHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  const ticket = getLocalWarpTicket();
  if (!ticket || headers.Authorization || headers.authorization) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Warpgate ${ticket}`,
  };
}

export type PublicApiResult<T> =
  | { status: 'ok'; data: T }
  // 대상이 없다. 검색엔진에 색인되지 않게 noindex 처리한다.
  | { status: 'not-found' }
  // 서버 장애 등 일시적 실패. 색인을 막지 않고 기본 메타로 응답한다.
  | { status: 'error' };

export interface PublicApiCacheOptions {
  /** Next 데이터 캐시 수명(초). 0이면 캐시하지 않는다. */
  revalidate: number;
  tags: string[];
}

function isNotFound(
  status: number,
  body: { errors?: { code: string }[] } | null,
) {
  if (status === 404) return true;
  return (
    body?.errors?.some((error) => error.code.endsWith('_NOT_FOUND')) ?? false
  );
}

/**
 * 서버에서 비로그인 공개 데이터를 조회한다. 메타데이터·JSON-LD처럼 크롤러가 받는 HTML을 만들 때 쓴다.
 * 사용자 토큰을 받지 않으므로 캐시된 응답이 사용자 사이에 공유돼도 개인 정보가 섞이지 않는다.
 * 200 응답만 Next 데이터 캐시에 저장되므로 실패는 캐시되지 않는다.
 * @param path 버전을 포함한 product-api 경로. 예: `/v1/alcohols/1`
 */
export async function fetchPublicApiOnServer<T>(
  path: `/v${number}/${string}`,
  { revalidate, tags }: PublicApiCacheOptions,
): Promise<PublicApiResult<T>> {
  try {
    const response = await fetch(`${getInternalServerOrigin()}/api${path}`, {
      method: 'GET',
      headers: internalApiHeaders({
        'Content-Type': 'application/json',
        ...SSR_CALLER_HEADER,
      }),
      next: { revalidate, tags },
    });

    const body = (await response.json().catch(() => null)) as {
      data: T;
      errors: { code: string }[];
    } | null;

    if (isNotFound(response.status, body)) return { status: 'not-found' };
    if (!response.ok || !body || body.errors.length !== 0) {
      return { status: 'error' };
    }

    return { status: 'ok', data: body.data };
  } catch (error) {
    console.error(`[internalApi] 공개 데이터 조회 실패 ${path}:`, error);
    return { status: 'error' };
  }
}
