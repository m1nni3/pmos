import { useState } from 'react'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DataTable from '../components/DataTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const RECENT_REPORTS = [
  { id: 'r1', name: 'Verification Summary Q1 2026', type: 'Verification', generated: '28 Mar 2026', status: 'ready' },
  { id: 'r2', name: 'Exception Report Mar 2026', type: 'Exception', generated: '30 Mar 2026', status: 'generating' },
  { id: 'r3', name: 'Reconciliation Report Feb 2026', type: 'Reconciliation', generated: '15 Mar 2026', status: 'ready' },
  { id: 'r4', name: 'Portfolio Summary Q1 2026', type: 'Portfolio', generated: '01 Apr 2026', status: 'ready' },
]

const COLUMNS = [
  { key: 'name', label: 'Report Name' },
  { key: 'type', label: 'Type' },
  { key: 'generated', label: 'Generated' },
  { key: 'status', label: 'Status' },
]

function renderCell(key, row) {
  if (key === 'status') {
    const cls = row.status === 'ready' ? 'matched' : 'pending'
    return <span className={`status ${cls}`}>{row.status}</span>
  }
  return row[key]
}

export default function Reporting() {
  const [selected, setSelected] = useState(null)

  const sel = RECENT_REPORTS.find(r => r.id === selected) || null

  return (
    <div className="section">
      <PageActions title="Reporting">
        <button className="btn primary">Generate Report</button>
        <button className="btn">Schedule</button>
        <button className="btn">Export</button>
      </PageActions>
      <SummaryMetrics metrics={[
        { label: 'Reports Generated', value: '12', trend: 'This quarter' },
        { label: 'Scheduled', value: '3', trend: 'Active schedules' },
        { label: 'Templates', value: '6', trend: 'Available' },
        { label: 'Last Generated', value: '2h ago', trend: 'Exception Report' },
      ]} />
      <div className="report-form-section">
        <div className="report-form-panel">
          <div className="report-section-title">Generate Report</div>
          <div className="report-form-grid">
            <select><option>Verification Summary</option><option>Exception Report</option><option>Financial Statement</option><option>Reconciliation Report</option></select>
            <select><option>All Properties</option></select>
            <select><option>Jan 2026</option></select>
            <select><option>Mar 2026</option></select>
          </div>
          <div className="report-actions">
            <button className="btn primary">Generate</button>
            <button className="btn">Schedule</button>
          </div>
        </div>
        <div className="report-form-panel">
          <div className="report-section-title">Quick Actions</div>
          <div className="report-quick-list">
            <button className="btn">Export All Exceptions</button>
            <button className="btn">Monthly Reconciliation Pack</button>
            <button className="btn">Portfolio Snapshot</button>
          </div>
        </div>
      </div>
      <div className="workspace">
        <DataTable
          columns={COLUMNS}
          rows={RECENT_REPORTS}
          selectedId={selected}
          onSelect={setSelected}
          onRenderCell={renderCell}
        />
        <DetailPanel title={sel ? sel.name : 'Report Preview'}>
          {sel ? (
            <>
              <div className="detail-section">
                <h4>Report Info</h4>
                <div className="detail-row"><span className="lbl">Name</span><span className="val">{sel.name}</span></div>
                <div className="detail-row"><span className="lbl">Type</span><span className="val">{sel.type}</span></div>
                <div className="detail-row"><span className="lbl">Generated</span><span className="val">{sel.generated}</span></div>
                <div className="detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${sel.status === 'ready' ? 'matched' : 'pending'}`}>{sel.status}</span></span></div>
              </div>
              {sel.status === 'ready' && (
                <div className="detail-section">
                  <h4>Actions</h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn primary" style={{ padding: '6px 14px', fontSize: 12 }}>Download</button>
                    <button className="btn" style={{ padding: '6px 14px', fontSize: 12 }}>Share</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="text">Select a report to preview</div>
            </div>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
