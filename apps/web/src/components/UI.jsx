import { C, FONT, R, SHADOW, EASE, EASE_OUT, FOCUS, T, S } from '../styles'

const btnBase = {
  padding: '0.45rem 1rem',
  borderRadius: R.md,
  cursor: 'pointer',
  fontSize: T.sm,
  fontWeight: 600,
  transition: `all ${EASE_OUT}`,
  border: 'none',
  lineHeight: 1.4,
}

const focusRing = {
  '&:focus-visible': { outline: 'none', boxShadow: FOCUS },
}

export function Spinner({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.navy}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height,
      background: `linear-gradient(90deg, ${C.border} 25%, #f1f5f9 50%, ${C.border} 75%)`,
      backgroundSize: '200% 100%',
      borderRadius: R.sm,
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

export function Empty({ msg = 'No data found.', icon, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem 1.5rem',
      color: C.muted, fontSize: T.base,
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon || '📋'}</div>
      <div style={{ maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>{msg}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div style={{
      padding: '0.75rem 1rem', borderRadius: R.md, marginBottom: '1rem', fontSize: T.sm,
      background: `${C.danger}10`, border: `1px solid ${C.danger}30`,
      color: C.danger, animation: 'slideDown 0.2s ease-out',
      display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between',
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          ...btnBase, background: 'transparent', color: C.danger,
          border: `1px solid ${C.danger}40`, padding: '0.2rem 0.6rem', fontSize: T.xs,
        }}>Retry</button>
      )}
    </div>
  )
}

export function Card({ children, style = {}, hover = false }) {
  return (
    <div style={{
      background: C.card, borderRadius: R.md, border: `1px solid ${C.border}`,
      overflow: 'hidden', transition: `box-shadow ${EASE}`,
      ...(hover ? { '&:hover': { boxShadow: SHADOW.md } } : {}),
      ...style,
    }}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, borderRadius: R.md, border: `1px solid ${C.border}`, padding: '1rem 1.25rem', transition: `box-shadow ${EASE}` }}>
      <div style={{ fontSize: T.xs, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: accent || C.text, fontFamily: FONT }}>{value}</div>
      {sub && <div style={{ fontSize: T.xs, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function Input({ label, value, onChange, type = 'text', error, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
      {label && <span style={{ fontSize: T.xs, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>}
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{
          padding: '0.45rem 0.65rem', border: `1px solid ${error ? C.danger : C.border}`,
          borderRadius: R.md, fontSize: T.sm, color: C.text, background: '#f8fafc',
          outline: 'none', transition: `border-color ${EASE}, box-shadow ${EASE}`,
        }}
        onFocus={e => { e.currentTarget.style.boxShadow = FOCUS; e.currentTarget.style.borderColor = C.blue }}
        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = error ? C.danger : C.border }}
        {...rest} />
      {error && <span style={{ fontSize: T.xs, color: C.danger }}>{error}</span>}
    </label>
  )
}

export function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
      {label && <span style={{ fontSize: T.xs, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          padding: '0.45rem 0.65rem', border: `1px solid ${C.border}`,
          borderRadius: R.md, fontSize: T.sm, color: C.text,
          background: '#f8fafc', cursor: 'pointer',
          outline: 'none', transition: `border-color ${EASE}, box-shadow ${EASE}`,
        }}
        onFocus={e => { e.currentTarget.style.boxShadow = FOCUS; e.currentTarget.style.borderColor = C.blue }}
        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
        {children}
      </select>
    </label>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, style = {}, size = 'md' }) {
  const sizes = {
    sm: { padding: '0.25rem 0.6rem', fontSize: T.xs },
    md: { padding: '0.45rem 1rem', fontSize: T.sm },
    lg: { padding: '0.6rem 1.25rem', fontSize: T.base },
  }
  const styles = {
    primary: { background: C.navy, color: C.white, border: 'none', '&:hover': { background: C.navyL } },
    secondary: { background: 'transparent', color: C.navy, border: `1px solid ${C.navy}`, '&:hover': { background: C.navy + '08' } },
    danger: { background: C.danger, color: C.white, border: 'none', '&:hover': { background: '#b91c1c' } },
    ghost: { background: '#f1f5f9', color: C.text, border: `1px solid ${C.border}`, '&:hover': { background: '#e2e8f0' } },
  }
  const s = styles[variant]
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={e => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.background = C.navyL
          else if (variant === 'danger') e.currentTarget.style.background = '#b91c1c'
          else if (variant === 'ghost') e.currentTarget.style.background = '#e2e8f0'
          else if (variant === 'secondary') e.currentTarget.style.background = C.navy + '08'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.background = C.navy
          else if (variant === 'danger') e.currentTarget.style.background = C.danger
          else if (variant === 'ghost') e.currentTarget.style.background = '#f1f5f9'
          else if (variant === 'secondary') e.currentTarget.style.background = 'transparent'
        }
      }}
      style={{
        ...btnBase,
        ...sizes[size],
        background: s.background,
        color: s.color,
        border: s.border,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}>
      {children}
    </button>
  )
}

export function Tabs({ tabs, active, setActive }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: '1rem', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t.key || t} onClick={() => setActive(t.key || t)}
          style={{
            padding: '0.6rem 1rem', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: T.sm,
            fontWeight: active === (t.key || t) ? 700 : 500,
            color: active === (t.key || t) ? C.navy : C.muted,
            borderBottom: active === (t.key || t) ? `2px solid ${C.navy}` : '2px solid transparent',
            marginBottom: -2, whiteSpace: 'nowrap',
            transition: `color ${EASE}, border-color ${EASE}`,
          }}
          onFocus={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
          {t.label || t}
        </button>
      ))}
    </div>
  )
}

export function Table({ cols, rows, keyFn, hover = true, striped = false }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: T.sm }}>
        <thead>
          <tr style={{
            borderBottom: `2px solid ${C.border}`,
            position: 'sticky', top: 0,
            background: C.card, zIndex: 1,
          }}>
            {cols.map(c => (
              <th key={c.key || c.label} style={{
                textAlign: 'left', padding: '0.5rem 0.75rem',
                color: C.muted, fontWeight: 600, fontSize: T.xs,
                textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                ...c.thStyle,
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyFn ? keyFn(row) : i} style={{
              borderBottom: `1px solid ${C.border}`,
              transition: `background ${EASE}`,
              background: striped && i % 2 === 1 ? '#f8fafc' : 'transparent',
            }}
              onMouseEnter={e => { if (hover) e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = striped && i % 2 === 1 ? '#f8fafc' : 'transparent' }}>
              {cols.map(c => (
                <td key={c.key || c.label} style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', ...c.tdStyle }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatRow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '0.6rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: C.bg, borderRadius: R.sm, padding: '0.6rem 0.8rem', animation: `fadeIn 0.3s ease-out` }}>
          <div style={{ fontSize: T.xs, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>{item.label}</div>
          <div style={{ fontSize: T.lg, fontWeight: 700, color: item.accent || C.text, marginTop: 2 }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
