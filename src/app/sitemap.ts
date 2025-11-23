import { MetadataRoute } from 'next';
import { ApiResponse } from '@/types/common';
import { ExploreReview } from '@/types/Explore';
import { BASE_URL } from '@/constants/common';

const SITEMAP_CONFIG = {
  PAGE_SIZE: 1000,
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

interface AlcoholResponse {
  alcohols: Array<{
    alcoholId: number;
    engCategoryName: string;
    modifyDate?: string;
    createDate: string;
  }>;
  totalCount: number;
}

interface ReviewResponse {
  items: ExploreReview[];
}

async function fetchAlcoholPages(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetchFromAPI<ApiResponse<AlcoholResponse>>(
      `/alcohols/search?sortType=POPULAR&sortOrder=DESC&cursor=0&pageSize=${SITEMAP_CONFIG.PAGE_SIZE}`,
    );

    if (response.errors.length === 0 && response.data.alcohols) {
      return response.data.alcohols.map((alcohol) => ({
        url: `${baseUrl}/search/${alcohol.engCategoryName}/${alcohol.alcoholId}`,
        lastModified: parseDate(alcohol.modifyDate || alcohol.createDate),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('❌ [Sitemap] Failed to fetch alcohols:', error);
  }

  return [];
}

async function fetchReviewPages(
  baseUrl: string,
): Promise<{ pages: MetadataRoute.Sitemap; reviewItems: ExploreReview[] }> {
  try {
    const response = await fetchFromAPI<ApiResponse<ReviewResponse>>(
      `/reviews/explore/standard?keywords=&cursor=0&size=${SITEMAP_CONFIG.PAGE_SIZE}`,
    );

    if (response.errors.length === 0 && response.data.items) {
      const reviewItems = response.data.items;
      const pages = reviewItems.map((review) => ({
        url: `${baseUrl}/review/${review.reviewId}`,
        lastModified: parseDate(review.modifiedAt || review.createAt),
        changeFrequency: 'daily' as const,
        priority: 1,
      }));

      return { pages, reviewItems };
    }
  } catch (error) {
    console.error('❌ [Sitemap] Failed to fetch reviews:', error);
  }

  return { pages: [], reviewItems: [] };
}

/**
 * 사용자 페이지 목록 생성 (리뷰 작성자 기반)
 */
function generateUserPages(
  baseUrl: string,
  reviewItems: ExploreReview[],
): MetadataRoute.Sitemap {
  try {
    if (reviewItems.length === 0) {
      return [];
    }

    // 중복 제거: userId 기준으로 고유한 사용자만 추출
    const uniqueUsers = Array.from(
      new Map(
        reviewItems.map((review) => [review.userInfo.userId, review.userInfo]),
      ).values(),
    );

    return uniqueUsers.map((user) => ({
      url: `${baseUrl}/user/${user.userId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${BASE_URL}/announcement`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
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

    const [alcoholPages, { pages: reviewPages, reviewItems }] =
      await Promise.all([
        fetchAlcoholPages(BASE_URL),
        fetchReviewPages(BASE_URL),
      ]);

    const userPages = generateUserPages(BASE_URL, reviewItems);

    return [
      ...staticPages,
      ...exploreTabs,
      ...alcoholPages,
      ...reviewPages,
      ...userPages,
    ];
  } catch (error) {
    return staticPages;
  }
}
