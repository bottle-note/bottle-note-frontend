/* eslint-disable global-require */
import type { Config } from 'tailwindcss';

export const tailwindColors = {
  mainCoral: '#EF9A6E',
  subCoral: '#E58257',
  bgGray: '#E6E6DD',
  brightGray: '#BFBFBF',
  gray: '#2B2B2B',
  mainBlack: '#101010',
  mainDarkGray: '#252525',
  mainGray: '#666666',
  sectionWhite: '#F7F7F7',
};

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        ...tailwindColors,
      },
      fontSize: {
        '9': ['9px', '9px'],
        '10': ['10px', '14px'],
        '11': ['11px', '15px'],
        '12': ['12px', '16px'],
        '13': ['13px', '17px'],
        '15': ['15px', '19px'],
        '16': ['16px', '20px'],
        '20': ['20px', '24px'],
        '27': ['27px', '31px'],
      },
      lineHeight: {
        sm: '14px',
      },
      spacing: {
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '2.75': '0.688rem',
        '3.25': '0.813rem',
        '3.5': '0.875rem',
        '3.75': '0.938rem',
        '4.5': '1.125rem',
        '5.25': '1.313rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '8.75': '2.188rem',
        '11.5': '2.875rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide'), require('tailwindcss-animate')],
};

export default config;
