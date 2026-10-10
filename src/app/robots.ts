import { MetadataRoute } from 'next';
import { BASE_URL } from '@/constants/common';
import { isProductionDeployment } from '@/lib/environment';

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/user',
          '/review/modify',
          '/review/register',
          '/history',
          '/settings',
          '/report',
          '/inquire',
          '/inquire/register',
          '/image-viewer',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
