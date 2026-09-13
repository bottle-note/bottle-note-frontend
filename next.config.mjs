import { getServerApiUrl } from './src/api/_shared/serverApiUrl.mjs';

const buildTime = new Date().toLocaleString('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  reactStrictMode: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async rewrites() {
    const baseUrlV1 = getServerApiUrl('v1');
    const baseUrlV2 = getServerApiUrl('v2');

    return [
      { source: '/bottle-api/v1/:path*', destination: `${baseUrlV1}/:path*` },
      { source: '/bottle-api/v2/:path*', destination: `${baseUrlV2}/:path*` },
    ];
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [390, 468],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 7776000, // 3개월
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.whiskybase.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bottlenote.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dzjkrmkt5t9bn.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd3dvjqqnb91j9d.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
