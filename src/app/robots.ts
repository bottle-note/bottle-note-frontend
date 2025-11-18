import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
