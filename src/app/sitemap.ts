import { MetadataRoute } from 'next';
import { ApiResponse } from '@/api/_shared/types';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import type { ExploreAlcohol, ExploreReview } from '@/api/explore/types';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import { ROUTES } from '@/constants/routes';
import { BASE_URL, SSR_CALLER_HEADER } from '@/constants/common';
import {
  alcoholCanonicalPath,
  alcoholReviewsCanonicalPath,
} from '@/shared/seo/alcoholMetadata';
import {
  getInternalServerOrigin,
  internalApiHeaders,
} from '@/shared/api/internalApi';

const SITEMAP_CONFIG = {
  PAGE_SIZE: 100,
  ALCOHOL_CACHE_TTL_MS: 24 * 60 * 60 * 1000,
  IMPORT_CLEARANCE_CACHE_TTL_MS: 24 * 60 * 60 * 1000,
  CONTENT_CACHE_TTL_MS: 60 * 60 * 1000,
  ERROR_RETRY_MS: 60 * 1000,
};

// 사이트맵은 빌드 시점에 고정하지 않고, 서버 프로세스별로 성공한 결과를 재사용한다.
export const dynamic = 'force-dynamic';

function parseDate(dateString: string | undefined | null): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const serverUrl = `${getInternalServerOrigin()}/api`;

  const url = `${serverUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: internalApiHeaders({
      'Content-Type': 'application/json',
      ...SSR_CALLER_HEADER,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function fetchCursorItems<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  while (true) {
    const queryParams = new URLSearchParams(params);
    queryParams.set('size', String(SITEMAP_CONFIG.PAGE_SIZE));
    if (cursor) queryParams.set('cursor', cursor);

    const response = await fetchFromAPI<ApiResponse<{ items: T[] } | T[]>>(
      `${endpoint}?${queryParams.toString()}`,
    );
    if (response.errors.length !== 0) {
      throw new Error(`Sitemap API returned errors for ${endpoint}`);
    }

    items.push(
      ...(Array.isArray(response.data) ? response.data : response.data.items),
    );

    const pagination = response.meta.pagination;
    if (!pagination?.hasNext || !pagination.nextCursor) break;
    if (seenCursors.has(pagination.nextCursor)) {
      throw new Error('Sitemap cursor repeated');
    }

    seenCursors.add(pagination.nextCursor);
    cursor = pagination.nextCursor;
  }

  return items;
}

async function fetchAlcoholPages(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  const alcohols = await fetchCursorItems<ExploreAlcohol>(
    '/v1/alcohols/explore/standard',
    new URLSearchParams({ sortType: 'POPULAR', sortOrder: 'DESC' }),
  );

  const detailPages = alcohols.map((alcohol) => ({
    url: `${baseUrl}${alcoholCanonicalPath(alcohol.alcoholId)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 게스트는 상세에서 리뷰 목록 링크를 볼 수 없어 크롤러 발견 경로로 sitemap에 넣는다.
  const reviewListPages = alcohols
    .filter((alcohol) => (alcohol.reviewCount ?? 0) > 0)
    .map((alcohol) => ({
      url: `${baseUrl}${alcoholReviewsCanonicalPath(alcohol.alcoholId)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...detailPages, ...reviewListPages];
}

async function fetchReviewPages(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  const reviewItems = await fetchCursorItems<ExploreReview>(
    '/v1/reviews/explore/standard',
    new URLSearchParams({ keywords: '' }),
  );

  return reviewItems.map((review) => ({
    url: `${baseUrl}/review/${review.reviewId}`,
    lastModified: parseDate(review.modifiedAt || review.createAt),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));
}

async function fetchCurationPages(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  // Product 피드에서 실제 노출하는 네 유형을 모두 조회한다.
  const params = new URLSearchParams();
  Object.values(CURATION_V2_SPEC_CODES).forEach((code) => {
    params.append('code', code);
  });
  const curations = await fetchCursorItems<CurationV2FeedItem>(
    '/v2/curations/feed',
    params,
  );

  return curations.map((curation) => ({
    url: `${baseUrl}${ROUTES.CURATION.DETAIL(curation.id)}`,
  }));
}

async function fetchImportClearancePages(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  const declarations = await fetchCursorItems<MfdsAlcoholListItem>(
    '/v1/mfds/alcohols',
    new URLSearchParams(),
  );

  return declarations.map((declaration) => ({
    url: `${baseUrl}${ROUTES.IMPORT_CLEARANCE.ALCOHOL(declaration.id)}`,
  }));
}

function cacheSitemapPages(
  load: () => Promise<MetadataRoute.Sitemap>,
  ttlMs: number,
) {
  let cachedPages: MetadataRoute.Sitemap | null = null;
  let expiresAt = 0;
  let retryAfter = 0;
  let pending: Promise<MetadataRoute.Sitemap> | null = null;

  return async () => {
    const now = Date.now();
    if (cachedPages && now < expiresAt) return cachedPages;

    if (!pending && now >= retryAfter) {
      pending = refresh();
    }

    // 첫 조회 중에는 빈 목록을, 갱신 중에는 이전 결과를 즉시 반환한다.
    // 정적 URL은 sitemap()에서 별도로 합쳐진다.
    return cachedPages ?? [];
  };

  function refresh() {
    return load()
      .then((pages) => {
        cachedPages = pages;
        expiresAt = Date.now() + ttlMs;
        retryAfter = 0;
        return pages;
      })
      .catch((error) => {
        console.error('❌ [Sitemap] Failed to refresh pages:', error);
        retryAfter = Date.now() + SITEMAP_CONFIG.ERROR_RETRY_MS;
        return cachedPages ?? [];
      })
      .finally(() => {
        pending = null;
      });
  }
}

const getAlcoholPages = cacheSitemapPages(
  () => fetchAlcoholPages(BASE_URL),
  SITEMAP_CONFIG.ALCOHOL_CACHE_TTL_MS,
);
const getReviewPages = cacheSitemapPages(
  () => fetchReviewPages(BASE_URL),
  SITEMAP_CONFIG.CONTENT_CACHE_TTL_MS,
);
const getCurationPages = cacheSitemapPages(
  () => fetchCurationPages(BASE_URL),
  SITEMAP_CONFIG.CONTENT_CACHE_TTL_MS,
);
const getImportClearancePages = cacheSitemapPages(
  () => fetchImportClearancePages(BASE_URL),
  SITEMAP_CONFIG.IMPORT_CLEARANCE_CACHE_TTL_MS,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NODE_ENV !== 'production') {
    return [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/privacy-collection-use`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/marketing-consent`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const exploreTabs: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}${ROUTES.CURATION.BASE}`,
    },
    {
      url: `${BASE_URL}/explore?tab=EXPLORER_WHISKEY`,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/explore?tab=REVIEW_WHISKEY`,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  const contentPages = await Promise.all([
    getAlcoholPages(),
    getReviewPages(),
    getCurationPages(),
    getImportClearancePages(),
  ]);

  return [...staticPages, ...exploreTabs, ...contentPages.flat()];
}
