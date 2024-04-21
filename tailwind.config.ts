import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        xxs: ['10px', { lineHeight: '16px' }],
      },
      spacing: {
        '1.5': '0.375rem', // 6px
        '2.5': '0.625rem', // 10px
        '2.75': '0.688rem', // 11px
        '3.25': '0.813rem', // 13px
        '3.5': '0.875rem', // 14px
        '3.75': '0.938rem', // 15px
        '4.5': '1.125rem', // 18px
        '5.25': '1.313rem', // 21px
        '7.5': '1.875rem', // 30px
        '8.5': '2.125rem', // 34px
        '8.75': '2.188rem', // 35px
        '11.5': '2.875rem', // 46px
      },
      colors: {
        mainCoral: '#EF9A6E',
        subCoral: '#E58257',
        bgGray: '#E6E6DD',
        mainBlack: '#101010',
        mainDarkGray: '#252525',
        mainGray: '#666666',
        subGray: '#F6F6F6',
        burgundy: '#581D17',
      },
    },
  },
  plugins: [],
};
export default config;
