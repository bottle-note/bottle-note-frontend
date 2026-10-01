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
  // 검색엔진 색인, 공유 링크, 서버가 내려주는 기존 주소를 새 경로로 옮긴다.
  async redirects() {
    return [
      {
        source: '/search/:category/:id(\\d+)/reviews',
        destination: '/alcohols/:id/reviews',
        permanent: true,
      },
      {
        source: '/search/:category/:id(\\d+)',
        destination: '/alcohols/:id',
        permanent: true,
      },
      // 큐레이션 위스키 목록 검색은 큐레이션 상세 화면이 대신한다.
      {
        source: '/search',
        has: [
          { type: 'query', key: 'curationId', value: '(?<curationId>\\d+)' },
        ],
        destination: '/curation/:curationId',
        permanent: true,
      },
      // 목록 검색은 둘러보기 위스키 탭으로 옮겼다. keyword·category 쿼리는 그대로 전달된다.
      {
        source: '/search',
        has: [{ type: 'query', key: 'regionId', value: '(?<regionId>.*)' }],
        destination: '/explore?tab=EXPLORER_WHISKEY&regionIds=:regionId',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/explore?tab=EXPLORER_WHISKEY',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const rawServerUrl =
      process.env.API_SERVER_WARP_URL || process.env.INTERNAL_SERVER_URL;
    if (!rawServerUrl) {
      throw new Error('INTERNAL_SERVER_URL is required');
    }

    const serverUrl = new URL(rawServerUrl).origin;

    // Browser Bearer tokens stay on Authorization; Warpgate ticket goes on the query.
    let ticket = null;
    for (const raw of [
      process.env.API_SERVER_WARP_URL,
      process.env.INTERNAL_SERVER_URL,
    ]) {
      if (!raw) continue;
      try {
        ticket = new URL(raw).searchParams.get('warpgate-ticket');
        if (ticket) break;
      } catch {
        ticket = null;
      }
    }
    const ticketQuery = ticket
      ? `?warpgate-ticket=${encodeURIComponent(ticket)}`
      : '';

    return [
      {
        source: '/bottle-api/v1/:path*',
        destination: `${serverUrl}/api/v1/:path*${ticketQuery}`,
      },
      {
        source: '/bottle-api/v2/:path*',
        destination: `${serverUrl}/api/v2/:path*${ticketQuery}`,
      },
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
