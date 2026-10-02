import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
      },
      colors: {
        lime: {
          DEFAULT: '#c8f135',
          dim: '#a4c82a',
        },
        bg: {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          hover: '#181818',
        },
        border: {
          DEFAULT: '#2a2a2a',
          bright: '#3a3a3a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
