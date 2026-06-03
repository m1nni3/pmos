export const C = {
  white: '#ffffff',
  bg: '#f5f6f8',
  card: '#ffffff',
  surface: '#f5f6f8',
  border: '#e4e7ec',
  borderLight: '#f2f4f7',
  text: '#101828',
  textSecondary: '#667085',
  muted: '#98a2b3',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryLight: '#eff6ff',
  primaryText: '#ffffff',
  navy: '#101828',
  navyL: '#1e293b',
  green: '#10b981',
  greenLight: '#d1fae5',
  success: '#16a34a',
  warn: '#f59e0b',
  warnLight: '#fef3c7',
  gold: '#f59e0b',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  blue: '#3b82f6',
  pink: '#ec4899',
  sidebar: '#101828',
  sidebarHover: '#1e293b',
  sidebarActive: '#3b82f6',
  sidebarText: '#98a2b3',
  sidebarTextActive: '#ffffff',
}

export const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
export const FONT_DISPLAY = "'DM Serif Display', Georgia, serif"
export const FONT_SERIF = FONT_DISPLAY

export const T = {
  xs: '0.6875rem',
  sm: '0.8125rem',
  base: '0.875rem',
  lg: '1rem',
  xl: '1.125rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
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
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}

export const SHADOW = {
  sm: '0 1px 2px rgba(16,24,40,0.04)',
  md: '0 4px 6px -2px rgba(16,24,40,0.04), 0 8px 16px -4px rgba(16,24,40,0.06)',
  lg: '0 12px 24px -8px rgba(16,24,40,0.08), 0 4px 8px -4px rgba(16,24,40,0.04)',
  xl: '0 20px 40px -12px rgba(16,24,40,0.12)',
}

export const EASE = '150ms ease-out'
export const EASE_OUT = '200ms ease-out'

export const FOCUS = `0 0 0 2px #fff, 0 0 0 4px ${C.primary}`

export const focusStyle = { outline: 'none', boxShadow: FOCUS }

export const fmt = (v) => 'R ' + Number(v || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtM = (v) => 'R ' + (Number(v || 0) / 1e6).toFixed(2) + 'M'

export const ICON = ''
