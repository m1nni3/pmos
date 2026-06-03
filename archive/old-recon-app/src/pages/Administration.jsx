import { useState } from 'react'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const SETTINGS_SECTIONS = [
  {
    title: 'Verification',
    items: [
      { label: 'Auto-run verification', value: 'Enabled', type: 'toggle' },
      { label: 'Exception threshold (ZAR)', value: 'R5,000', type: 'text' },
      { label: 'Notification on exception', value: 'Enabled', type: 'toggle' },
    ],
  },
  {
    title: 'Reconciliation',
    items: [
      { label: 'Auto-reconcile threshold', value: 'R1,000', type: 'text' },
      { label: 'Require approval', value: 'Yes', type: 'toggle' },
      { label: 'Default property', value: 'All Properties', type: 'select' },
    ],
  },
  {
    title: 'Display',
    items: [
      { label: 'Records per page', value: '50', type: 'text' },
      { label: 'Default view', value: 'All Properties', type: 'select' },
      { label: 'Time zone', value: 'Africa/Johannesburg', type: 'select' },
    ],
  },
]

export default function Administration() {
  const [selectedSetting, setSelectedSetting] = useState(null)

  return (
    <div className="section">
      <PageActions title="Administration">
        <button className="btn primary">Save Changes</button>
        <button className="btn">Reset</button>
      </PageActions>
      <SummaryMetrics metrics={[
        { label: 'Active Users', value: '4', trend: 'System administrators' },
        { label: 'Data Stores', value: '19', trend: 'Database tables' },
        { label: 'API Status', value: 'Connected', trend: 'All systems' },
        { label: 'Last Backup', value: 'Today', trend: 'Automatic' },
      ]} />
      <div className="workspace">
        <div className="master" style={{ overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SETTINGS_SECTIONS.map(section => (
            <div key={section.title} className="settings-card">
              <div className="settings-card-header">{section.title}</div>
              {section.items.map(item => (
                <div key={item.label} className="settings-row" onClick={() => setSelectedSetting(item)}>
                  <span className="label">{item.label}</span>
                  <span className="value">{item.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <DetailPanel title={selectedSetting ? selectedSetting.label : 'Setting Details'}>
          {selectedSetting ? (
            <>
              <div className="detail-section">
                <h4>Configuration</h4>
                <div className="detail-row"><span className="lbl">Setting</span><span className="val">{selectedSetting.label}</span></div>
                <div className="detail-row"><span className="lbl">Current Value</span><span className="val">{selectedSetting.value}</span></div>
                <div className="detail-row"><span className="lbl">Type</span><span className="val">{selectedSetting.type}</span></div>
              </div>
              <div className="detail-section">
                <h4>Actions</h4>
                <button className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>Edit Value</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="text">Click a setting to view details</div>
            </div>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
