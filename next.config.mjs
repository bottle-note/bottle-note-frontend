/** @type {import('next').NextConfig} */

const WHITE_LIST = ['*'];

const nextConfig = {
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
        hostname: 'static.whiskybase.com'',
        port: '',
        pathname: '/**',
      },
    ],
  },
  omains: WHITE_LIST,
};

export default nextConfig;
