import HomeCarousel from '@/components/feature/home/HomeCarousel';
import NavLayout from '@/components/ui/Layout/NavLayout';
import AutoHideLogoHeader from '@/components/ui/Navigation/AutoHideLogoHeader';
import JsonLd from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/utils/seo/generateWebSiteSchema';
import { MbtiPromoCard } from '@/components/feature/home/MbtiPromoCard';
import HomeFeaturedSection from '@/components/feature/home/HomeFeaturedSection';
import HomeCategorySection from '@/components/feature/home/HomeCategorySection';
import type { Banner } from '@/api/banner/types';
import type { ApiResponse } from '@/api/_shared/types';
import { SSR_CALLER_HEADER } from '@/constants/common';
import {
  getInternalServerOrigin,
  internalApiHeaders,
} from '@/shared/api/internalApi';

async function getBanners(): Promise<Banner[]> {
  try {
    const baseUrl = `${getInternalServerOrigin()}/api/v1`;
    const res = await fetch(`${baseUrl}/banners?limit=10`, {
      headers: internalApiHeaders({ ...SSR_CALLER_HEADER }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json: ApiResponse<Banner[]> = await res.json();
    return json.data ?? [];
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

        <MbtiPromoCard />

        <HomeCarousel banners={banners} />

        <div className="pt-22 pb-80">
          <HomeFeaturedSection />
          <HomeCategorySection />
        </div>
      </NavLayout>
    </>
  );
}
