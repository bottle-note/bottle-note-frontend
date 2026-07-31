/* eslint-disable global-require */
import type { Config } from 'tailwindcss';

const paletteColor = (token: string) =>
  `rgb(var(--palette-${token}) / <alpha-value>)`;

const semanticColor = (token: string) => `var(--color-${token})`;

export const paletteColors = {
  neutral: {
    0: paletteColor('neutral-0'),
    50: paletteColor('neutral-50'),
    200: paletteColor('neutral-200'),
    500: paletteColor('neutral-500'),
    600: paletteColor('neutral-600'),
    700: paletteColor('neutral-700'),
    800: paletteColor('neutral-800'),
    900: paletteColor('neutral-900'),
    950: paletteColor('neutral-950'),
    1000: paletteColor('neutral-1000'),
  },
  oak: {
    50: paletteColor('oak-50'),
    200: paletteColor('oak-200'),
    500: paletteColor('oak-500'),
    600: paletteColor('oak-600'),
    800: paletteColor('oak-800'),
    900: paletteColor('oak-900'),
    950: paletteColor('oak-950'),
    1000: paletteColor('oak-1000'),
  },
  coral: {
    50: paletteColor('coral-50'),
    300: paletteColor('coral-300'),
    400: paletteColor('coral-400'),
    500: paletteColor('coral-500'),
    600: paletteColor('coral-600'),
    700: paletteColor('coral-700'),
    900: paletteColor('coral-900'),
    1000: paletteColor('coral-1000'),
  },
  amber: {
    500: paletteColor('amber-500'),
    700: paletteColor('amber-700'),
  },
  static: {
    white: paletteColor('static-white'),
    black: paletteColor('static-black'),
    transparent: 'transparent',
  },
};

export const semanticColors = {
  fg: {
    neutral: {
      DEFAULT: semanticColor('fg-neutral'),
      muted: semanticColor('fg-neutral-muted'),
      subtle: semanticColor('fg-neutral-subtle'),
      inverted: semanticColor('fg-neutral-inverted'),
    },
    placeholder: semanticColor('fg-placeholder'),
    disabled: semanticColor('fg-disabled'),
    brand: {
      DEFAULT: semanticColor('fg-brand'),
      primary: semanticColor('fg-brand-primary'),
      contrast: semanticColor('fg-brand-contrast'),
    },
    rating: semanticColor('fg-rating'),
  },
  bg: {
    layer: {
      basement: semanticColor('bg-layer-basement'),
      default: {
        DEFAULT: semanticColor('bg-layer-default'),
        pressed: semanticColor('bg-layer-default-pressed'),
      },
      floating: semanticColor('bg-layer-floating'),
    },
    neutral: {
      weak: semanticColor('bg-neutral-weak'),
      solid: semanticColor('bg-neutral-solid'),
    },
    disabled: semanticColor('bg-disabled'),
    brand: {
      solid: {
        DEFAULT: semanticColor('bg-brand-solid'),
        pressed: semanticColor('bg-brand-solid-pressed'),
      },
      primary: {
        solid: semanticColor('bg-brand-primary-solid'),
      },
      weak: semanticColor('bg-brand-weak'),
    },
    overlay: {
      DEFAULT: semanticColor('bg-overlay'),
      muted: semanticColor('bg-overlay-muted'),
    },
    transparent: semanticColor('bg-transparent'),
  },
  stroke: {
    neutral: {
      basement: semanticColor('stroke-neutral-basement'),
      subtle: semanticColor('stroke-neutral-subtle'),
      weak: semanticColor('stroke-neutral-weak'),
      contrast: semanticColor('stroke-neutral-contrast'),
    },
    brand: {
      solid: semanticColor('stroke-brand-solid'),
      primary: {
        solid: semanticColor('stroke-brand-primary-solid'),
      },
      weak: semanticColor('stroke-brand-weak'),
      contrast: semanticColor('stroke-brand-contrast'),
    },
    'focus-ring': semanticColor('stroke-focus-ring'),
  },
};

export const tailwindColors = {
  mainCoral: '#EF9A6E',
  subCoral: '#E58257',
  bgGray: '#E6E6DD',
  brightGray: '#BFBFBF',
  mainGray: '#666666',
  textGray: '#C6C6C6',
  gray: '#2B2B2B',
  mainBlack: '#101010',
  mainDarkGray: '#252525',
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
      maxWidth: {
        content: '468px',
      },
      colors: {
        palette: paletteColors,
        ...semanticColors,
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        ...tailwindColors,
      },
      fontSize: {
        '9': ['9px', '9px'],
        '10': ['10px', '14px'],
        '11': ['11px', '15px'],
        '12': ['12px', '16px'],
        '13': ['13px', '17px'],
        '13.5': ['13.5px', '17.5px'],
        '14': ['14px', '18px'],
        '15': ['15px', '19px'],
        '16': ['16px', '20px'],
        '20': ['20px', '24px'],
        '24': ['24px', '28px'],
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
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('tailwindcss-animate'),
    // 커스텀 유틸리티 추가
    function ({ addUtilities }: any) {
      addUtilities({
        '.fixed-content': {
          '@apply fixed left-0 right-0 max-w-content mx-auto': {},
        },
        '.content-container': {
          '@apply max-w-content mx-auto w-full': {},
        },
      });
    },
  ],
};

export default config;
