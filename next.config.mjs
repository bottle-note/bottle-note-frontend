/** @type {import('next').NextConfig} */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const WHITE_LIST = ['*'];

const nextConfig = {
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
    ],
  },
  domains: WHITE_LIST,
};

export default nextConfig;
