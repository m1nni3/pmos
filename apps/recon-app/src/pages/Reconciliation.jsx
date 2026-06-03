import { useState, useEffect } from 'react'
import * as api from '../api.js'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DataTable from '../components/DataTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const COLUMNS = [
  { key: 'period', label: 'Period' },
  { key: 'rental_amount', label: 'Rental Amount' },
  { key: 'bank_amount', label: 'Bank Amount' },
  { key: 'variance', label: 'Variance' },
  { key: 'status', label: 'Status' },
]

export default function Reconciliation() {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reconciliation').then(data => {
      setRecords(data)
      if (data.length) setSelected(data[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const matchedCount = records.filter(r => r.status === 'matched' || r.status === 'verified').length
  const exceptionCount = records.filter(r => r.status === 'exception').length
  const totalVariance = records.reduce((s, r) => s + Number(r.variance || 0), 0)

  const metrics = [
    { label: 'Periods Reconciled', value: String(records.length) },
    { label: 'Matched', value: String(matchedCount) },
    { label: 'Exceptions', value: String(exceptionCount) },
    { label: 'Total Variance', value: `R${Math.abs(totalVariance).toLocaleString()}`, trend: totalVariance < 0 ? 'Negative' : 'Balanced' },
  ]

  const sel = records.find(r => r.id === selected) || null

  function renderCell(key, row) {
    if (key === 'status') {
      const cls = row.status
      return <span className={`status ${cls}`}>{cls}</span>
    }
    if (['rental_amount', 'bank_amount', 'variance'].includes(key)) {
      const val = Number(row[key])
      const cls = key === 'variance' ? (val < 0 ? 'negative' : val > 0 ? 'positive' : '') : ''
      return <span className={cls}>R{val.toLocaleString()}</span>
    }
    return row[key]
  }

  return (
    <div className="section">
      <PageActions title="Reconciliation">
        <select><option>All Properties</option></select>
        <select><option>All Status</option></select>
        <button className="btn primary">Run Reconciliation</button>
        <button className="btn">Export</button>
      </PageActions>
      <SummaryMetrics metrics={metrics} />
      <div className="workspace">
        <DataTable
          columns={COLUMNS}
          rows={records}
          selectedId={selected}
          onSelect={setSelected}
          onRenderCell={renderCell}
        />
        <DetailPanel title={sel ? `Period: ${sel.period}` : 'Reconciliation'} accentTag={sel ? sel.status : null}>
          {sel ? (
            <>
              <div className="detail-section">
                <h4>Reconciliation Summary</h4>
                <div className="detail-row"><span className="lbl">Period</span><span className="val">{sel.period}</span></div>
                <div className="detail-row"><span className="lbl">Rental Amount</span><span className="val">R{Number(sel.rental_amount).toLocaleString()}</span></div>
                <div className="detail-row"><span className="lbl">Bank Amount</span><span className="val">R{Number(sel.bank_amount).toLocaleString()}</span></div>
                <div className="detail-row"><span className="lbl">Variance</span><span className={`val variance${Number(sel.variance) < 0 ? ' negative' : Number(sel.variance) > 0 ? ' positive' : ''}`}>R{Number(sel.variance).toLocaleString()}</span></div>
                <div className="detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${sel.status}`}>{sel.status}</span></span></div>
              </div>
              {sel.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>{sel.notes}</div>
                </div>
              )}
              <div className="detail-section">
                <h4>Activity</h4>
                <div className="activity-item"><span className={`activity-dot${sel.status === 'matched' || sel.status === 'verified' ? ' matched' : ' exception'}`}></span><strong>Reconciled</strong> — {sel.updated_at ? new Date(sel.updated_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="text">Select a period to view details</div>
            </div>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
