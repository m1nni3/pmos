import { useState, useEffect } from 'react'
import { get } from '../api'
import { C, fmt, FONT, R, T } from '../styles'
import { Spinner, Empty, ErrorBanner, Card, Table, Btn, Select } from '../components/UI'

const REPORT_TYPES = [
  { key: 'portfolio', label: 'Portfolio Summary' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'reconciliation', label: 'Reconciliation' },
  { key: 'maintenance', label: 'Maintenance' },
]

export default function Reports() {
  const [type, setType] = useState('portfolio')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [properties, setProperties] = useState([])
  const [propId, setPropId] = useState('')

  useEffect(() => { get('/properties').then(setProperties).catch(() => {}) }, [])

  const runReport = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    let path = `/reports/${type}`
    if (propId) path += `?property_id=${propId}`
    const res = await get(path).catch(e => { setError(e.message); return null })
    setData(res)
    setLoading(false)
  }

  const downloadCSV = () => {
    if (!data || data.length === 0) return
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${type}-report.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const cols = data && data.length > 0 ? Object.keys(data[0]).map(k => ({ key: k, label: k.replace(/_/g, ' ') })) : []

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, fontFamily: FONT }}>
      <h1 style={{ fontSize: 20, margin: '0 0 0.25rem', fontWeight: 700 }}>Reports</h1>
      <p style={{ margin: '0 0 1.5rem', color: C.muted, fontSize: T.sm }}>Generate portfolio reports</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <Select label="Report Type" value={type} onChange={setType}>
          {REPORT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </Select>
        <Select label="Property (optional)" value={propId} onChange={setPropId}>
          <option value="">All properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Btn onClick={runReport}>Run Report</Btn>
        {data && data.length > 0 && <Btn variant="ghost" onClick={downloadCSV}>⬇ Download CSV</Btn>}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && <Spinner />}

      {!loading && !data && !error && (
        <Empty icon="📄" msg="Select a report type and click 'Run Report' to generate data." />
      )}

      {!loading && data && data.length === 0 && (
        <Empty icon="📋" msg="Report returned no data for the selected criteria." />
      )}

      {!loading && data && data.length > 0 && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: T.sm, color: C.muted }}>{data.length} row{data.length !== 1 ? 's' : ''}</p>
          </div>
          <Card>
            <Table cols={cols} rows={data} striped hover />
          </Card>
        </div>
      )}
    </div>
  )
}
