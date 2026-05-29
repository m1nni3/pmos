import { C, FONT, R, T, SHADOW } from '../styles'
import { Card, Input, Btn } from '../components/UI'

export default function Settings() {
  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 800, fontFamily: FONT }}>
      <h1 style={{ fontSize: 20, margin: '0 0 0.25rem', fontWeight: 700 }}>Settings</h1>
      <p style={{ margin: '0 0 1.5rem', color: C.muted, fontSize: T.sm }}>Manage application preferences</p>

      <Card style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: T.base, fontWeight: 600, margin: '0 0 1rem' }}>Display</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: T.sm, fontWeight: 500, display: 'block', marginBottom: 4, color: C.text }}>
              Currency Format
            </label>
            <div style={{ fontSize: T.sm, color: C.muted }}>ZAR (R) — configured on server</div>
          </div>
          <div>
            <label style={{ fontSize: T.sm, fontWeight: 500, display: 'block', marginBottom: 4, color: C.text }}>
              Date Format
            </label>
            <div style={{ fontSize: T.sm, color: C.muted }}>YYYY-MM-DD — configured on server</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: T.base, fontWeight: 600, margin: '0 0 1rem' }}>Data</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: T.sm, fontWeight: 500, display: 'block', marginBottom: 4, color: C.text }}>
              API Endpoint
            </label>
            <div style={{ fontSize: T.sm, color: C.muted }}>https://pmos-api.binos-opms.workers.dev/api</div>
          </div>
          <div>
            <label style={{ fontSize: T.sm, fontWeight: 500, display: 'block', marginBottom: 4, color: C.text }}>
              Last Sync
            </label>
            <div style={{ fontSize: T.sm, color: C.muted }}>Real-time</div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: T.base, fontWeight: 600, margin: '0 0 1rem' }}>Notifications</h3>
        <div style={{ fontSize: T.sm, color: C.muted }}>
          Notifications are coming soon. This section will allow you to configure email and in-app alerts for maintenance requests, lease renewals, and budget thresholds.
        </div>
      </Card>
    </div>
  )
}
