import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
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
