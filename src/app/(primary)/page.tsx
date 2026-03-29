import HomeCarousel from '@/components/feature/home/HomeCarousel';
import HomeHeader from '@/components/feature/home/HomeHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import JsonLd from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/utils/seo/generateWebSiteSchema';
import { TarotPromoCard } from '@/components/feature/home/TarotPromoCard';
import HomeTabSection from '@/components/feature/home/HomeTabSection';
import type { Banner } from '@/api/banner/types';
import type { ApiResponse } from '@/api/_shared/types';

async function getBanners(): Promise<Banner[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const res = await fetch(`${baseUrl}/banners?limit=10`, {
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
        <HomeHeader />

        <TarotPromoCard />

        <HomeCarousel banners={banners} />

        <HomeTabSection />
      </NavLayout>
    </>
  );
}
