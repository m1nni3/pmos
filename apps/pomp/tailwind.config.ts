import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1rem' }],
        sm: ['0.9375rem', { lineHeight: '1.25rem' }],
        base: ['1.0625rem', { lineHeight: '1.5rem' }],
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],
        xl: ['1.3125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5625rem', { lineHeight: '2rem' }],
      },
      colors: {
        pomp: {
          navy: '#081F5C',
          'navy-hover': '#0F2E87',
          'navy-active': '#143FAF',
          blue: '#008DFF',
          teal: '#26D0CE',
          green: '#67D300',
          orange: '#FFB000',
          red: '#FF4D4D',
          magenta: '#D400FF',
          purple: '#9B51E0',
          light: '#F7F9FC',
          border: '#DDE3EC',
        },
      },
      borderRadius: {
        card: '1.2rem',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
