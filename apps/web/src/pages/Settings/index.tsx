import { useEffect, useState } from 'react'

interface Config {
  apiUrl: string
  appName: string
  defaultLocale: string
}

const DEFAULTS: Config = {
  apiUrl:         '',
  appName:       'PMOS',
  defaultLocale: 'en-ZA',
}

export default function Settings() {
  const [cfg, setCfg] = useState<Config>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pmos_settings')
    if (stored) setCfg({ ...DEFAULTS, ...JSON.parse(stored) })
  }, [])

  function save() {
    localStorage.setItem('pmos_settings', JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields: { key: keyof Config; label: string; readonly?: boolean }[] = [
    { key: 'appName',       label: 'Application Name' },
    { key: 'apiUrl',   label: 'API URL', readonly: true },
    { key: 'defaultLocale', label: 'Default Locale' },
  ]

  return (
    <div>
      <h1 style={s.h1}>Settings</h1>
      <div style={s.card}>
        <h2 style={s.h2}>General</h2>
        <div style={s.grid}>
          {fields.map(f => (
            <label key={f.key} style={s.lbl}>
              <span style={s.lblTxt}>{f.label}</span>
              <input
                style={{ ...s.input, ...(f.readonly ? s.readonly : {}) }}
                value={cfg[f.key]}
                readOnly={f.readonly}
                onChange={e => setCfg(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <div style={s.actions}>
          <button style={s.btn} onClick={save}>Save</button>
          {saved && <span style={s.saved}>✓ Saved</span>}
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.h2}>About</h2>
        <p style={s.meta}>PMOS — Property Management Oversight System</p>
        <p style={s.meta}>Stack: React · TypeScript · Cloudflare Pages · D1</p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  h1:      { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' },
  h2:      { fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' },
  card:    { background: '#fff', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' },
  lbl:     { display: 'flex', flexDirection: 'column', gap: 4 },
  lblTxt:  { fontSize: '0.75rem', color: '#6b7280' },
  input:   { padding: '0.4rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: '0.85rem' },
  readonly:{ background: '#f9fafb', color: '#9ca3af' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  btn:     { padding: '0.35rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  saved:   { color: '#22c55e', fontSize: '0.85rem' },
  meta:    { fontSize: '0.83rem', color: '#6b7280', marginBottom: '0.4rem' },
}
