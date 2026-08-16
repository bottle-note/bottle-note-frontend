import { MetadataRoute } from 'next';
import { ApiResponse } from '@/api/_shared/types';
import type { ExploreAlcohol, ExploreReview } from '@/api/explore/types';
import { BASE_URL } from '@/constants/common';

const SITEMAP_CONFIG = {
  PAGE_SIZE: 100,
  CACHE_POLICY: 'no-store' as const,
};

function parseDate(dateString: string | undefined | null): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverUrl) {
    throw new Error('NEXT_PUBLIC_SERVER_URL is not set');
  }

  const url = `${serverUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: SITEMAP_CONFIG.CACHE_POLICY,
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
  params: Record<string, string>,
): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  while (true) {
    const queryParams = new URLSearchParams({
      ...params,
      size: String(SITEMAP_CONFIG.PAGE_SIZE),
    });
    if (cursor) queryParams.set('cursor', cursor);

    const response = await fetchFromAPI<ApiResponse<{ items: T[] }>>(
      `${endpoint}?${queryParams.toString()}`,
    );
    if (response.errors.length !== 0) break;

    items.push(...response.data.items);

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
  try {
    const alcohols = await fetchCursorItems<ExploreAlcohol>(
      '/alcohols/explore/standard',
      { sortType: 'POPULAR', sortOrder: 'DESC' },
    );

    return alcohols.map((alcohol) => ({
      url: `${baseUrl}/search/${alcohol.engCategory}/${alcohol.alcoholId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('❌ [Sitemap] Failed to fetch alcohols:', error);
  }

  return [];
}

async function fetchReviewPages(
  baseUrl: string,
): Promise<{ pages: MetadataRoute.Sitemap; reviewItems: ExploreReview[] }> {
  try {
    const reviewItems = await fetchCursorItems<ExploreReview>(
      '/reviews/explore/standard',
      { keywords: '' },
    );

    const pages = reviewItems.map((review) => ({
      url: `${baseUrl}/review/${review.reviewId}`,
      lastModified: parseDate(review.modifiedAt || review.createAt),
      changeFrequency: 'daily' as const,
      priority: 1,
    }));

    return { pages, reviewItems };
  } catch (error) {
    console.error('❌ [Sitemap] Failed to fetch reviews:', error);
  }

  return { pages: [], reviewItems: [] };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NODE_ENV !== 'production') {
    return [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/privacy-collection-use`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/marketing-consent`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  try {
    const exploreTabs: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/explore?tab=EXPLORER_WHISKEY`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/explore?tab=REVIEW_WHISKEY`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
    ];

    const [alcoholPages, { pages: reviewPages }] = await Promise.all([
      fetchAlcoholPages(BASE_URL),
      fetchReviewPages(BASE_URL),
    ]);

    return [...staticPages, ...exploreTabs, ...alcoholPages, ...reviewPages];
  } catch (error) {
    return staticPages;
  }
}
