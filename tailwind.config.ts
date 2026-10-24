import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'x-blue': '#1d9bf0',
        'x-blue-hover': '#1a8cd8',
        'bg-root': '#0B0F17',
        'surface-card': '#161F30',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        hairline: 'rgba(255, 255, 255, 0.08)',
      },
      borderColor: {
        hairline: 'rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'accent-ai': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.2' }],
        body: ['15px', { lineHeight: '1.33' }],
        subheading: ['20px', { lineHeight: '1.3' }],
        heading: ['23px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        card: '16px',
        input: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
