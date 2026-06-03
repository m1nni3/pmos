import { C, FONT, R, SHADOW, EASE, EASE_OUT, FOCUS, T, S } from '../styles'

const h = { height: 36, boxSizing: 'border-box' }

export function Spinner({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: size, height: size,
        border: `2.5px solid ${C.border}`,
        borderTopColor: C.primary,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

export function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height,
      background: `linear-gradient(90deg, ${C.border} 25%, ${C.borderLight} 50%, ${C.border} 75%)`,
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
      <div style={{
        width: 48, height: 48, margin: '0 auto 12px',
        borderRadius: R.lg, background: C.borderLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: C.muted,
      }}>{icon || '—'}</div>
      <div style={{ maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>{msg}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div style={{
      padding: '0.75rem 1rem', borderRadius: R.lg, marginBottom: '1rem', fontSize: T.sm,
      background: C.dangerLight, border: `1px solid ${C.danger}`,
      color: C.danger, animation: 'slideDown 0.2s ease-out',
      display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between',
    }}>
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '0.2rem 0.6rem', borderRadius: R.md,
          background: C.danger, color: C.white,
          border: 'none', cursor: 'pointer', fontSize: T.xs, fontWeight: 600,
        }}>Retry</button>
      )}
    </div>
  )
}

export function Card({ children, style = {}, hover = false, header, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.sm,
      overflow: 'hidden',
      transition: `box-shadow ${EASE}, transform ${EASE}`,
      cursor: onClick ? 'pointer' : undefined,
      ...(hover ? { ':hover': { boxShadow: SHADOW.md, transform: 'translateY(-1px)' } } : {}),
      ...style,
    }}>
      {header && (
        <div style={{
          padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`,
          fontWeight: 600, fontSize: T.sm, display: 'flex', alignItems: 'center', gap: 8,
        }}>{header}</div>
      )}
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`,
      padding: '1rem 1.25rem', position: 'relative', overflow: 'hidden',
      transition: `box-shadow ${EASE}`,
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
          background: accent, borderRadius: '0 2px 2px 0',
        }} />
      )}
      <div style={{
        fontSize: T.xs, color: C.muted, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: '1.375rem', fontWeight: 700, color: accent || C.text,
        fontFamily: FONT, lineHeight: 1.2,
      }}>{value}</div>
      {sub && <div style={{ fontSize: T.xs, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function Input({ label, value, onChange, type = 'text', error, placeholder, style: extStyle, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: S.xs, ...extStyle }}>
      {label && <span style={{ fontSize: T.xs, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>}
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...h,
          padding: '0 0.65rem', border: `1px solid ${error ? C.danger : C.border}`,
          borderRadius: R.lg, fontSize: T.sm, color: C.text, background: C.card,
          outline: 'none', transition: `border-color ${EASE}, box-shadow ${EASE}`,
          width: '100%',
        }}
        onFocus={e => { e.currentTarget.style.boxShadow = FOCUS; e.currentTarget.style.borderColor = C.primary }}
        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = error ? C.danger : C.border }}
        {...rest} />
      {error && <span style={{ fontSize: T.xs, color: C.danger }}>{error}</span>}
    </label>
  )
}

export function Select({ label, value, onChange, children, style: extStyle }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: S.xs, ...extStyle }}>
      {label && <span style={{ fontSize: T.xs, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          ...h,
          padding: '0 0.65rem', border: `1px solid ${C.border}`,
          borderRadius: R.lg, fontSize: T.sm, color: C.text,
          background: C.card, cursor: 'pointer',
          outline: 'none', transition: `border-color ${EASE}, box-shadow ${EASE}`,
          minWidth: 140,
        }}
        onFocus={e => { e.currentTarget.style.boxShadow = FOCUS; e.currentTarget.style.borderColor = C.primary }}
        onBlur={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
        {children}
      </select>
    </label>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled, style = {}, size = 'md', type }) {
  const sizes = {
    sm: { height: 30, padding: '0 0.6rem', fontSize: T.xs },
    md: { height: 36, padding: '0 1rem', fontSize: T.sm },
    lg: { height: 42, padding: '0 1.25rem', fontSize: T.base },
  }
  const s = sizes[size] || sizes.md
  const variants = {
    primary: { background: C.primary, color: C.primaryText, border: 'none', hoverBg: C.primaryHover },
    secondary: { background: 'transparent', color: C.primary, border: `1px solid ${C.primary}`, hoverBg: C.primaryLight },
    ghost: { background: 'transparent', color: C.textSecondary, border: `1px solid ${C.border}`, hoverBg: C.borderLight },
    danger: { background: C.danger, color: C.white, border: 'none', hoverBg: '#b91c1c' },
  }
  const v = variants[variant] || variants.primary
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.background }}
      style={{
        ...s,
        borderRadius: R.lg, cursor: disabled ? 'default' : 'pointer',
        fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap',
        transition: `all ${EASE}`,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        opacity: disabled ? 0.45 : 1,
        background: v.background,
        color: v.color,
        border: v.border,
        ...style,
      }}>
      {children}
    </button>
  )
}

export function Tabs({ tabs, active, setActive, style }) {
  return (
    <div style={{
      display: 'flex', gap: 4, marginBottom: '1rem',
      background: C.borderLight, borderRadius: R.lg, padding: 3,
      overflowX: 'auto', ...style,
    }}>
      {tabs.map(t => (
        <button key={t.key || t} onClick={() => setActive(t.key || t)}
          style={{
            padding: '0.35rem 0.85rem', border: 'none', cursor: 'pointer',
            fontSize: T.sm,
            fontWeight: active === (t.key || t) ? 600 : 500,
            color: active === (t.key || t) ? C.text : C.muted,
            background: active === (t.key || t) ? C.card : 'transparent',
            borderRadius: R.md,
            boxShadow: active === (t.key || t) ? SHADOW.sm : 'none',
            whiteSpace: 'nowrap',
            transition: `all ${EASE}`,
          }}>
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
            borderBottom: `1.5px solid ${C.border}`,
          }}>
            {cols.map(c => (
              <th key={c.key || c.label} style={{
                textAlign: 'left', padding: '0.5rem 0.75rem',
                color: C.muted, fontWeight: 600, fontSize: T.xs,
                textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap',
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
              borderBottom: `1px solid ${C.borderLight}`,
              transition: `background ${EASE}`,
              background: striped && i % 2 === 1 ? C.surface : 'transparent',
            }}
              onMouseEnter={e => { if (hover) e.currentTarget.style.background = C.borderLight }}
              onMouseLeave={e => { e.currentTarget.style.background = striped && i % 2 === 1 ? C.surface : 'transparent' }}>
              {cols.map(c => (
                <td key={c.key || c.label} style={{
                  padding: '0.5rem 0.75rem', whiteSpace: 'nowrap',
                  color: C.text, ...c.tdStyle,
                }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: S.sm }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: C.borderLight, borderRadius: R.lg, padding: '0.6rem 0.8rem',
          animation: `fadeIn 0.3s ease-out`,
        }}>
          <div style={{ fontSize: T.xs, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>{item.label}</div>
          <div style={{ fontSize: T.lg, fontWeight: 700, color: item.accent || C.text, marginTop: 2 }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
