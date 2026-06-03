import { useEffect } from 'react'
import { C, FONT, R, T, SHADOW } from '../styles'
import { usePageTitle } from '../PageTitleContext'

export default function Settings() {
  const { setPageTitle, setPageSubtitle } = usePageTitle()
  useEffect(() => { setPageTitle('Settings'); setPageSubtitle('Application preferences and configuration') }, [])
  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 800, fontFamily: FONT }}>
      <div style={{ background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`, boxShadow: SHADOW.sm, marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: T.sm, color: C.text }}>Display</div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: T.sm, fontWeight: 500, marginBottom: 4, color: C.text }}>Currency Format</div>
            <div style={{ fontSize: T.sm, color: C.muted }}>ZAR (R) — configured on server</div>
          </div>
          <div>
            <div style={{ fontSize: T.sm, fontWeight: 500, marginBottom: 4, color: C.text }}>Date Format</div>
            <div style={{ fontSize: T.sm, color: C.muted }}>YYYY-MM-DD — configured on server</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`, boxShadow: SHADOW.sm, marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: T.sm, color: C.text }}>Data</div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: T.sm, fontWeight: 500, marginBottom: 4, color: C.text }}>API Endpoint</div>
            <div style={{ fontSize: T.sm, color: C.muted }}>/api (proxied to pmos-api.dawson-edc.workers.dev)</div>
          </div>
          <div>
            <div style={{ fontSize: T.sm, fontWeight: 500, marginBottom: 4, color: C.text }}>Last Sync</div>
            <div style={{ fontSize: T.sm, color: C.muted }}>Real-time</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`, boxShadow: SHADOW.sm, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: T.sm, color: C.text }}>Notifications</div>
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: T.sm, color: C.muted, lineHeight: 1.5 }}>
            Notifications are coming soon. This section will allow you to configure email and in-app alerts for maintenance requests, lease renewals, and budget thresholds.
          </div>
        </div>
      </div>
    </div>
  )
}
