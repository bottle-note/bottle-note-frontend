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
    ],
  },
  omains: WHITE_LIST,
};

export default nextConfig;
