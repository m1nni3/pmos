import { useState, useEffect } from 'react'
import * as api from '../api.js'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DataTable from '../components/DataTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const COLUMNS = [
  { key: 'id', label: 'WO #' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'raised_at', label: 'Raised' },
]

export default function Operations() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/work-orders').then(data => {
      setOrders(data)
      if (data.length) setSelected(data[0].id)
    }).finally(() => setLoading(false))
  }, [])

  const openCount = orders.filter(o => o.status === 'open' || o.status === 'in_progress').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  const metrics = [
    { label: 'Total Orders', value: String(orders.length) },
    { label: 'Open', value: String(openCount) },
    { label: 'Completed', value: String(completedCount) },
    { label: 'Completion Rate', value: orders.length ? `${Math.round(completedCount / orders.length * 100)}%` : '0%' },
  ]

  const sel = orders.find(o => o.id === selected) || null

  function renderCell(key, row) {
    if (key === 'status') {
      const cls = row.status === 'completed' ? 'matched' : row.status === 'in_progress' ? 'pending' : 'exception'
      return <span className={`status ${cls}`}>{row.status}</span>
    }
    if (key === 'raised_at') return row.raised_at ? new Date(row.raised_at).toLocaleDateString() : '—'
    if (key === 'id') return row.id.slice(0, 8)
    return row[key]
  }

  return (
    <div className="section">
      <PageActions title="Operations">
        <select><option>All Properties</option></select>
        <select><option>All Status</option></select>
        <button className="btn primary">New Work Order</button>
        <button className="btn">Export</button>
      </PageActions>
      <SummaryMetrics metrics={metrics} />
      <div className="workspace">
        <DataTable
          columns={COLUMNS}
          rows={orders}
          selectedId={selected}
          onSelect={setSelected}
          onRenderCell={renderCell}
        />
        <DetailPanel title={sel ? `WO-${sel.id.slice(0, 8)}` : 'Work Order'}>
          {sel ? (
            <>
              <div className="detail-section">
                <h4>Details</h4>
                <div className="detail-row"><span className="lbl">Status</span><span className="val">{sel.status}</span></div>
                <div className="detail-row"><span className="lbl">Description</span><span className="val">{sel.description}</span></div>
                <div className="detail-row"><span className="lbl">Raised</span><span className="val">{sel.raised_at ? new Date(sel.raised_at).toLocaleDateString() : '—'}</span></div>
                <div className="detail-row"><span className="lbl">Cost</span><span className="val">{sel.cost ? `R${Number(sel.cost).toLocaleString()}` : '—'}</span></div>
              </div>
              {sel.completed_at && (
                <div className="detail-section">
                  <h4>Completion</h4>
                  <div className="activity-item"><strong>Completed</strong> — {new Date(sel.completed_at).toLocaleDateString()}</div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="text">No work order selected</div>
            </div>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
