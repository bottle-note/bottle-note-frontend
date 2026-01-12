/** @type {import('next').NextConfig} */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const BASE_URL_V2 = process.env.NEXT_PUBLIC_SERVER_URL_V2;

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // 심볼릭 링크 비활성화
    outputFileTracingExcludes: ['**/*'],
  },
  async rewrites() {
    return [
      { source: '/bottle-api/v1/:path*', destination: `${BASE_URL}/:path*` },
      { source: '/bottle-api/v2/:path*', destination: `${BASE_URL_V2}/:path*` },
      { source: '/bottle-api/:path*', destination: `${BASE_URL}/:path*` },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 430, 640, 750, 828, 1080],
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
