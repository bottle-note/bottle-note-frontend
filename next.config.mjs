/** @type {import('next').NextConfig} */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const WHITE_LIST = ['*'];

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // 심볼릭 링크 비활성화
    outputFileTracingIgnores: ['**/*'],
  },
  async rewrites() {
    return [
      { source: '/bottle-api/:path*', destination: BASE_URL + '/:path*' },
    ];
  },
  images: {
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
        hostname: 'cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  domains: WHITE_LIST,
};

export default nextConfig;
