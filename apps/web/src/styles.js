export const C = {
  navy: '#1a2744',
  navyL: '#243356',
  green: '#27ae60',
  gold: '#f5a623',
  pink: '#e91e8c',
  blue: '#2196f3',
  white: '#ffffff',
  bg: '#f0f2f7',
  card: '#ffffff',
  text: '#1a2744',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  warn: '#d97706',
  danger: '#dc2626',
}

export const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
export const FONT_SERIF = "'DM Serif Display', 'Georgia', serif"

export const T = {
  xs: '11px',
  sm: '13px',
  base: '14px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
}

export const S = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
}

export const R = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

export const SHADOW = {
  sm: '0 1px 3px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.06)',
  lg: '0 8px 24px rgba(0,0,0,0.08)',
}

export const EASE = '0.15s ease'
export const EASE_OUT = '0.2s ease-out'

export const fmt = (v) => 'R ' + Number(v || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtM = (v) => 'R ' + (Number(v || 0) / 1e6).toFixed(2) + 'M'

export const ICON = 'https://img.icons8.com/?size=160&id=0uYcfoG9OUaw&format=png'

export const FOCUS = `0 0 0 2px #fff, 0 0 0 4px ${C.blue}`

export const focusStyle = { outline: 'none', boxShadow: FOCUS }
