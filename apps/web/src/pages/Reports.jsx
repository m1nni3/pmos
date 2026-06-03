import { useState, useEffect } from 'react'
import { get } from '../api'
import { C, fmt, FONT, R, T, SHADOW } from '../styles'
import { Spinner, Empty, ErrorBanner, Table, Btn, Select } from '../components/UI'
import { usePageTitle } from '../PageTitleContext'

const REPORT_TYPES = [
  { key: 'portfolio', label: 'Portfolio Summary' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'reconciliation', label: 'Reconciliation' },
  { key: 'maintenance', label: 'Maintenance' },
]

export default function Reports() {
  const { setPageTitle, setPageSubtitle } = usePageTitle()
  useEffect(() => { setPageTitle('Reports'); setPageSubtitle('Generate portfolio reports') }, [])
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

      <div style={{
        background: C.card, borderRadius: R.lg, border: `1px solid ${C.border}`,
        padding: '1.25rem', marginBottom: '1.5rem', boxShadow: SHADOW.sm,
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Select label="Report Type" value={type} onChange={setType}>
            {REPORT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Select>
          <Select label="Property (optional)" value={propId} onChange={setPropId}>
            <option value="">All properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Btn onClick={runReport}>Run Report</Btn>
          {data && data.length > 0 && <Btn variant="ghost" onClick={downloadCSV}>Download CSV</Btn>}
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && <Spinner />}

      {!loading && !data && !error && (
        <Empty icon="?" msg="Select a report type and click 'Run Report' to generate data." />
      )}

      {!loading && data && data.length === 0 && (
        <Empty icon="?" msg="Report returned no data for the selected criteria." />
      )}

      {!loading && data && data.length > 0 && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: T.sm, color: C.muted }}>{data.length} row{data.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: R.lg, overflow: 'hidden' }}>
            <Table cols={cols} rows={data} striped hover />
          </div>
        </div>
      )}
    </div>
  )
}
