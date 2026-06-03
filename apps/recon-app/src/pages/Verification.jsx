import { useState, useEffect } from 'react'
import * as api from '../api.js'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DataTable from '../components/DataTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const LEVY_COLUMNS = [
  { key: 'period', label: 'Period' },
  { key: 'rental_amount', label: 'Agent Claims Paid' },
  { key: 'bank_amount', label: 'Body Corp Received' },
  { key: 'variance', label: 'Variance' },
  { key: 'status', label: 'Status' },
]

const RENTAL_COLUMNS = [
  { key: 'unit_number', label: 'Unit' },
  { key: 'tenant_name', label: 'Tenant' },
  { key: 'rent_due', label: 'Rent Due' },
  { key: 'rent_collected', label: 'Rent Collected' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'status', label: 'Status' },
]

const MUNICIPAL_COLUMNS = [
  { key: 'period', label: 'Period' },
  { key: 'municipal_charged', label: 'Municipal Charged' },
  { key: 'agent_collected', label: 'Agent Collected' },
  { key: 'paid_to_municipal', label: 'Paid to Municipal' },
  { key: 'variance', label: 'Variance' },
  { key: 'status', label: 'Status' },
]

const TABS = [
  { id: 'levy', label: 'Levy Verification' },
  { id: 'rental', label: 'Rental Verification' },
  { id: 'municipal', label: 'Municipal Verification' },
]

const SEED_LEVY = [
  { id: '1', period: 'Mar 2026', rental_amount: 178560, bank_amount: 172000, variance: -6560, status: 'exception' },
  { id: '2', period: 'Feb 2026', rental_amount: 182300, bank_amount: 182300, variance: 0, status: 'matched' },
  { id: '3', period: 'Jan 2026', rental_amount: 179800, bank_amount: 179800, variance: 0, status: 'matched' },
  { id: '4', period: 'Dec 2025', rental_amount: 186000, bank_amount: 186000, variance: 0, status: 'verified' },
  { id: '5', period: 'Nov 2025', rental_amount: 162400, bank_amount: 162400, variance: 0, status: 'matched' },
  { id: '6', period: 'Oct 2025', rental_amount: 186000, bank_amount: 186000, variance: 0, status: 'verified' },
  { id: '7', period: 'Sep 2025', rental_amount: 175200, bank_amount: 170000, variance: -5200, status: 'exception' },
  { id: '8', period: 'Aug 2025', rental_amount: 186000, bank_amount: 186000, variance: 0, status: 'verified' },
  { id: '9', period: 'Jul 2025', rental_amount: 180100, bank_amount: 180100, variance: 0, status: 'matched' },
  { id: '10', period: 'Jun 2025', rental_amount: 186000, bank_amount: 186000, variance: 0, status: 'verified' },
  { id: '11', period: 'May 2025', rental_amount: 186000, bank_amount: 186000, variance: 0, status: 'verified' },
  { id: '12', period: 'Apr 2025', rental_amount: 178560, bank_amount: 178560, variance: 0, status: 'matched' },
]

const SEED_RENTAL = [
  { id: 'r1', unit_number: '101', tenant_name: 'J. Smith', rent_due: 12000, rent_collected: 12000, deposit: 24000, status: 'matched' },
  { id: 'r2', unit_number: '102', tenant_name: 'P. Adams', rent_due: 9500, rent_collected: 9500, deposit: 19000, status: 'verified' },
  { id: 'r3', unit_number: '103', tenant_name: 'L. Nkosi', rent_due: 11000, rent_collected: 10000, deposit: 22000, status: 'exception' },
  { id: 'r4', unit_number: '104', tenant_name: 'T. Botha', rent_due: 8500, rent_collected: 8500, deposit: 17000, status: 'matched' },
  { id: 'r5', unit_number: '105', tenant_name: 'M. Dlamini', rent_due: 13000, rent_collected: 0, deposit: 26000, status: 'pending' },
  { id: 'r6', unit_number: '106', tenant_name: 'K. George', rent_due: 10000, rent_collected: 10000, deposit: 20000, status: 'verified' },
]

const SEED_MUNICIPAL = [
  { id: 'm1', period: 'Mar 2026', municipal_charged: 94200, agent_collected: 94200, paid_to_municipal: 90000, variance: -4200, status: 'exception' },
  { id: 'm2', period: 'Feb 2026', municipal_charged: 91800, agent_collected: 91800, paid_to_municipal: 91800, variance: 0, status: 'verified' },
  { id: 'm3', period: 'Jan 2026', municipal_charged: 95100, agent_collected: 95100, paid_to_municipal: 95100, variance: 0, status: 'verified' },
]

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000) return `R${n.toLocaleString()}`
  return `R${n}`
}

function renderCell(key, row, tab) {
  if (key === 'status') {
    const cls = row.status
    return <span className={`status ${cls}`}>{cls}</span>
  }
  if (['rental_amount', 'bank_amount', 'variance', 'rent_due', 'rent_collected', 'deposit', 'municipal_charged', 'agent_collected', 'paid_to_municipal'].includes(key)) {
    const val = Number(row[key])
    const cls = key === 'variance' ? (val < 0 ? 'negative' : val > 0 ? 'positive' : '') : ''
    return <span className={cls}>{fmt(val)}</span>
  }
  return row[key]
}

function DetailContent({ record, tab }) {
  if (!record) return <div className="empty-state"><div className="text">Select a record</div></div>

  if (tab === 'levy') {
    const v = Number(record.variance)
    return (
      <>
        <div className="detail-section">
          <h4>Verification Summary</h4>
          <div className="detail-row"><span className="lbl">Period</span><span className="val">{record.period}</span></div>
          <div className="detail-row"><span className="lbl">Agent Claims Paid</span><span className="val">{fmt(record.rental_amount)}</span></div>
          <div className="detail-row"><span className="lbl">Body Corp Received</span><span className="val">{fmt(record.bank_amount)}</span></div>
          <div className="detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmt(v)}</span></div>
          <div className="detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
        </div>
        {record.status === 'exception' && (
          <div className="detail-section">
            <h4>Exception Details</h4>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>
              Variance of {fmt(Math.abs(v))} between agent claims and body corp receipts. Requires investigation.
            </div>
          </div>
        )}
        <div className="detail-section">
          <h4>Activity</h4>
          <div className="activity-item"><span className="activity-dot exception"></span><strong>Verification run</strong> — Auto <span className="time">Today</span></div>
          <div className="activity-item"><span className="activity-dot exception"></span><strong>Exception flagged</strong> <span className="time">Today</span></div>
        </div>
      </>
    )
  }

  if (tab === 'rental') {
    const v = Number(record.rent_due) - Number(record.rent_collected)
    return (
      <>
        <div className="detail-section">
          <h4>Unit Summary</h4>
          <div className="detail-row"><span className="lbl">Unit</span><span className="val">{record.unit_number}</span></div>
          <div className="detail-row"><span className="lbl">Tenant</span><span className="val">{record.tenant_name}</span></div>
          <div className="detail-row"><span className="lbl">Rent Due</span><span className="val">{fmt(record.rent_due)}</span></div>
          <div className="detail-row"><span className="lbl">Rent Collected</span><span className="val">{fmt(record.rent_collected)}</span></div>
          <div className="detail-row"><span className="lbl">Deposit Held</span><span className="val">{fmt(record.deposit)}</span></div>
          <div className="detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmt(v)}</span></div>
          <div className="detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
        </div>
        <div className="detail-section">
          <h4>Activity</h4>
          <div className="activity-item"><span className={`activity-dot${record.rent_collected > 0 ? ' matched' : ' exception'}`}></span><strong>Rent collection</strong> — {record.rent_collected > 0 ? 'Received' : 'Outstanding'} <span className="time">Mar 2026</span></div>
        </div>
      </>
    )
  }

  if (tab === 'municipal') {
    const v = Number(record.variance)
    return (
      <>
        <div className="detail-section">
          <h4>Verification Summary</h4>
          <div className="detail-row"><span className="lbl">Period</span><span className="val">{record.period}</span></div>
          <div className="detail-row"><span className="lbl">Municipal Charged</span><span className="val">{fmt(record.municipal_charged)}</span></div>
          <div className="detail-row"><span className="lbl">Agent Collected</span><span className="val">{fmt(record.agent_collected)}</span></div>
          <div className="detail-row"><span className="lbl">Paid to Municipal</span><span className="val">{fmt(record.paid_to_municipal)}</span></div>
          <div className="detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmt(v)}</span></div>
          <div className="detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
        </div>
        {record.status === 'exception' && (
          <div className="detail-section">
            <h4>Exception Details</h4>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>
              {fmt(Math.abs(v))} collected but not remitted to municipality.
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}

export default function Verification() {
  const [tab, setTab] = useState('levy')
  const [selected, setSelected] = useState(null)

  const dataMap = { levy: SEED_LEVY, rental: SEED_RENTAL, municipal: SEED_MUNICIPAL }
  const colMap = { levy: LEVY_COLUMNS, rental: RENTAL_COLUMNS, municipal: MUNICIPAL_COLUMNS }
  const rows = dataMap[tab]
  const cols = colMap[tab]
  const record = rows.find(r => r.id === selected) || null

  const exceptionCount = rows.filter(r => r.status === 'exception').length
  const matchedCount = rows.filter(r => r.status === 'matched' || r.status === 'verified').length
  const totalVariance = rows.reduce((s, r) => {
    if (tab === 'levy') return s + Number(r.variance)
    if (tab === 'rental') return s + (Number(r.rent_due) - Number(r.rent_collected))
    if (tab === 'municipal') return s + Number(r.variance)
    return s
  }, 0)

  const metrics = [
    { label: 'Total Records', value: String(rows.length) },
    { label: 'Matched', value: String(matchedCount) },
    { label: 'Exceptions', value: String(exceptionCount) },
    { label: 'Net Variance', value: fmt(totalVariance) },
  ]

  const tabLabels = { levy: 'Levy Verification', rental: 'Rental Verification', municipal: 'Municipal Verification' }

  return (
    <div className="section">
      <PageActions title={tabLabels[tab]}>
        <button className="btn primary">Run Verification</button>
        <button className="btn">Export</button>
      </PageActions>
      <SummaryMetrics metrics={metrics} />
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
        {TABS.map(t => (
          <div
            key={t.id}
            className={`detail-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => { setTab(t.id); setSelected(null) }}
          >
            {t.label}
          </div>
        ))}
      </div>
      <div className="workspace">
        <DataTable
          columns={cols}
          rows={rows}
          selectedId={selected}
          onSelect={setSelected}
          onRenderCell={(key, row) => renderCell(key, row, tab)}
        />
        <DetailPanel title={record ? (record.period || record.unit_number) : 'Verification'} accentTag={record ? record.status : null}>
          <DetailContent record={record} tab={tab} />
        </DetailPanel>
      </div>
    </div>
  )
}
