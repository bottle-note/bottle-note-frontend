import HomeCarousel from '@/components/feature/home/HomeCarousel';
import NavLayout from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import JsonLd from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/utils/seo/generateWebSiteSchema';
import HomeQuickLinks from '@/components/feature/home/HomeQuickLinks';
import HomeFeaturedSection from '@/components/feature/home/HomeFeaturedSection';
import HomeCategorySection from '@/components/feature/home/HomeCategorySection';
import HomeCurationSection from '@/components/feature/home/HomeCurationSection';
import HomeReviewSection from '@/components/feature/home/HomeReviewSection';
import type { Banner } from '@/api/banner/types';
import type { ApiResponse } from '@/api/_shared/types';
import { SSR_CALLER_HEADER } from '@/constants/common';
import {
  getInternalServerOrigin,
  internalApiHeaders,
} from '@/shared/api/internalApi';
import { filterBannersByDate } from './_utils/filterBannersByDate';

async function getBanners(): Promise<Banner[]> {
  try {
    const baseUrl = `${getInternalServerOrigin()}/api/v1`;
    const res = await fetch(`${baseUrl}/banners?limit=10`, {
      headers: internalApiHeaders({ ...SSR_CALLER_HEADER }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json: ApiResponse<Banner[]> = await res.json();
    return filterBannersByDate(json.data ?? []);
  } catch {
    return [];
  }
}

export default async function Home() {
  const banners = await getBanners();
  const webSiteSchemas = generateWebSiteSchema();

  return (
    <>
      <link
        rel="preload"
        href="/images/banner-placeholder.webp"
        as="image"
        type="image/webp"
      />
      {webSiteSchemas.map((schema) => (
        <JsonLd key={schema['@type']} data={schema} />
      ))}
      <NavLayout>
        <AutoHideLogoHeader />

        <HomeCarousel banners={banners} />

        <HomeQuickLinks />

        <div className="space-y-40 pt-28 pb-[var(--navbar-total-space)]">
          <HomeFeaturedSection />
          <HomeCurationSection />
          <HomeCategorySection />
          <HomeReviewSection />
        </div>
      </NavLayout>
    </>
  );
}
