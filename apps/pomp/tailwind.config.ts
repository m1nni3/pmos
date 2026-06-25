import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontSize: {
        xs:   ['0.875rem',  { lineHeight: '1.125rem' }],
        sm:   ['1rem',      { lineHeight: '1.375rem' }],
        base: ['1.125rem',  { lineHeight: '1.625rem' }],
        lg:   ['1.25rem',   { lineHeight: '1.875rem' }],
        xl:   ['1.4375rem', { lineHeight: '1.875rem' }],
        '2xl':['1.6875rem', { lineHeight: '2.125rem' }],
      },
      colors: {
        pomp: {
          // Primary brand
          blue:    '#1ABB9C',
          green:   '#43D000',
          orange:  '#FF8A00',
          pink:    '#FF2D95',
          purple:  '#7A2CFF',
          // Neutrals
          navy:    '#0D0D0D',
          slate:   '#525666',
          gray:    '#8A909C',
          border:  '#C7CBD4',
          light:   '#F4F6F8',
          // Accents
          cyan:    '#00C8FF',
          teal:    '#00BFA5',
          yellow:  '#FFD600',
          lime:    '#A8FF00',
          indigo:  '#4B5BFF',
          coral:   '#FF5A4D',
          turq:    '#00E0D4',
          // Legacy aliases
          'navy-hover':   '#1a1a2e',
          'navy-active':  '#2d2d4e',
          magenta:        '#FF2D95',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1ABB9C 0%, #43D000 25%, #FF8A00 50%, #FF2D95 75%, #7A2CFF 100%)',
      },
      borderRadius: {
        card: '1rem',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body:    ['Inter',   'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
