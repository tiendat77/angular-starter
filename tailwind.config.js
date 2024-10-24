const path = require('path');
const plugin = require('tailwindcss/plugin');

/**
 * @type {import('./tailwind/theming').Theme}
 * Generate at: https://uicolors.app
 */
const theme = {
  primary: {
    50: '#fff0f1',
    100: '#ffdee1',
    200: '#ffc3c8',
    300: '#ff99a1',
    400: '#ff5f6c',
    500: '#ff2d3e',
    600: '#f50d20',
    700: '#d70718',
    800: '#aa0a17',
    900: '#8c101a',
    DEFAULT: '#d70718',
  },
  'on-primary': {
    500: '#ffffff',
    DEFAULT: '#ffffff',
  },
  secondary: {
    50: '#f0f7fe',
    100: '#deecfb',
    200: '#c4e0f9',
    300: '#9cccf4',
    400: '#6dafed',
    500: '#4b90e6',
    600: '#3674da',
    700: '#2d60c8',
    800: '#2a4fa3',
    900: '#274481',
    950: '#0f172a',
    DEFAULT: '#0f172a',
  },
  'on-secondary': {
    500: '#ffffff',
    DEFAULT: '#ffffff',
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      scale: {
        97: '0.97',
        98: '0.98',
        99: '0.99',
      },
      opacity: {
        12: '0.12',
        38: '0.38',
        87: '0.87',
      },
      extendedSpacing: {
        // Fractional values
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',

        // Bigger values
        42: '10.5rem',
        43: '10.75rem',
        84: '21rem',
        100: '25rem',
        120: '30rem',
        128: '32rem',
        140: '35rem',
        160: '40rem',
        180: '45rem',
        192: '48rem',
        200: '50rem',
        240: '60rem',
        256: '64rem',
        280: '70rem',
        320: '80rem',
        360: '90rem',
        400: '100rem',
        480: '120rem',
      },
      width: (theme) => ({
        ...theme('spacing'),
        ...theme('extendedSpacing'),
      }),
      maxWidth: (theme) => ({
        container: '1440px',
        ...theme('spacing'),
        ...theme('extendedSpacing'),
      }),
      minWidth: (theme) => ({
        ...theme('spacing'),
        ...theme('extendedSpacing'),
        screen: '100vw',
      }),
      minHeight: (theme) => ({
        ...theme('spacing'),
        ...theme('extendedSpacing'),
        screen: '100vh',
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require(path.resolve(__dirname, 'tailwind/safe-area')),
    require(path.resolve(__dirname, 'tailwind/theming'))({ theme }),

    plugin(({ addComponents }) => {
      addComponents({
        '.bg-card': {
          '--tw-bg-opacity': '1',
          backgroundColor: 'rgba(var(--bg-card-rgb), var(--tw-bg-opacity))',
        },
        '.bg-card-200': {
          '--tw-bg-opacity': '1',
          backgroundColor: 'rgba(var(--bg-card-200-rgb), var(--tw-bg-opacity))',
        },
        '.bg-default': {
          '--tw-bg-opacity': '1',
          backgroundColor: 'rgba(var(--bg-default-rgb), var(--tw-bg-opacity))',
        },
        '.shadow-card': {
          '--tw-shadow': 'rgba(var(--shadow-card-rgb), 0.2) 0px 8px 24px',
          boxShadow:
            'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);',
        },
        '.text-default': {
          '--tw-text-opacity': '1',
          color: 'rgba(var(--text-default-rgb), var(--tw-text-opacity))',
        },
        '.text-hint': {
          '--tw-text-opacity': '1',
          color: 'rgba(var(--text-hint-rgb), var(--tw-text-opacity))',
        },
        '.text-disabled': {
          '--tw-text-opacity': '1',
          color: 'rgba(var(--text-disabled-rgb), var(--tw-text-opacity))',
        },
        '.no-scroll-bar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};
