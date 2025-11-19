import { MetadataRoute } from 'next';
import { BASE_URL } from '@/constants/common';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/user/*/edit',
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
