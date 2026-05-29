import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { get, put, post, del } from '../api'
import { C, fmt, fmtM } from '../styles'
import { Spinner, Empty, StatCard, Table, Btn, Select } from '../components/UI'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ledgers', label: 'Ledgers' },
  { key: 'pnl', label: 'P&L' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'reconciliation', label: 'Reconciliation' },
]

const LEDGER_TYPES = ['rental_ledger', 'levy_ledger', 'bank_ledger', 'municipality_ledger']
const LEDGER_LABELS = { rental_ledger: 'Rental', levy_ledger: 'Levy', bank_ledger: 'Bank', municipality_ledger: 'Municipality' }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Budget data from user's spreadsheet (Option A: net per property per month)
const NET_BUDGET = {
  oakdale: [-2949, -2949, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696],
  malindi: [1760, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993],
  villeroy: [23, 23, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80],
  indaba: [-142, -142, -142, 71, 71, 71, 71, 71, 71, 71, 71, 71],
}

// Per-category budget (Option B) from spreadsheet
const CATEGORY_BUDGET = {
  oakdale: {
    income: [12200, 12200, 13700, 13700, 13700, 13700, 13700, 13700, 13700, 13700, 13700, 13700],
    levy: [2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584],
    bond: [9652, 9652, 9652, 9652, 9652, 9652, 9652, 9652, 9652, 9652, 9652, 9652],
    agent: [1403, 1403, 1576, 1576, 1576, 1576, 1576, 1576, 1576, 1576, 1576, 1576],
    municipal: [900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900],
    maintenance: [610, 610, 685, 685, 685, 685, 685, 685, 685, 685, 685, 685],
  },
  malindi: {
    income: [5216, 5475, 5475, 5475, 5475, 5475, 5475, 5475, 5475, 5475, 5475, 5475],
    levy: [2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584],
    bond: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    agent: [522, 548, 548, 548, 548, 548, 548, 548, 548, 548, 548, 548],
    municipal: [350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350],
    maintenance: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  villeroy: {
    income: [6005, 6005, 6005, 6005, 6005, 6005, 6005, 6005, 6005, 6005, 6005, 6005],
    levy: [1021, 1021, 1124, 1124, 1124, 1124, 1124, 1124, 1124, 1124, 1124, 1124],
    bond: [3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220],
    agent: [691, 691, 691, 691, 691, 691, 691, 691, 691, 691, 691, 691],
    municipal: [750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750],
    maintenance: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
  },
  indaba: {
    income: [5000, 5000, 5000, 5250, 5250, 5250, 5250, 5250, 5250, 5250, 5250, 5250],
    levy: [2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584, 2584],
    bond: [1661, 1661, 1661, 1661, 1661, 1661, 1661, 1661, 1661, 1661, 1661, 1661],
    agent: [500, 500, 500, 525, 525, 525, 525, 525, 525, 525, 525, 525],
    municipal: [147, 147, 147, 147, 147, 147, 147, 147, 147, 147, 147, 147],
    maintenance: [250, 250, 250, 263, 263, 263, 263, 263, 263, 263, 263, 263],
  },
}

// Per-category actuals from spreadsheet (only months with data)
const CATEGORY_ACTUAL = {
  oakdale: [
    { income: 12206, levy: 2584, bond: 9652, agent: 1443, municipal: 863, maintenance: 0 },
    { income: 12206, levy: 2734, bond: 9652, agent: 1443, municipal: 958, maintenance: 0 },
    { income: 12206, levy: 0, bond: 9652, agent: 1442, municipal: 879, maintenance: 0 },
    { income: 12206, levy: 2735, bond: 9652, agent: 40, municipal: 863, maintenance: 0 },
  ],
  malindi: [
    { income: 0, levy: 2087, bond: 0, agent: 0, municipal: 0, maintenance: 0 },
    { income: 0, levy: 2172, bond: 0, agent: 0, municipal: 0, maintenance: 0 },
    { income: 0, levy: 2183, bond: 0, agent: 0, municipal: 0, maintenance: 0 },
    { income: 0, levy: 0, bond: 0, agent: 0, municipal: 0, maintenance: 0 },
  ],
  villeroy: [
    { income: 5500, levy: 0, bond: 3167, agent: 58, municipal: 399, maintenance: 7799 },
    { income: 5500, levy: 5417, bond: 3167, agent: 568, municipal: 400, maintenance: 0 },
    { income: 5500, levy: 1711, bond: 3167, agent: 568, municipal: 419, maintenance: 0 },
    { income: 5521, levy: 1111, bond: 0, agent: 59, municipal: 0, maintenance: 0 },
  ],
  indaba: [
    { income: 0, levy: 1510, bond: 1772, agent: 0, municipal: 616, maintenance: 0 },
    { income: 0, levy: 1510, bond: 1772, agent: 0, municipal: 782, maintenance: 0 },
    { income: 0, levy: 1510, bond: 1772, agent: 0, municipal: 0, maintenance: 0 },
    { income: 0, levy: 0, bond: 0, agent: 0, municipal: 0, maintenance: 0 },
  ],
}

const ACTUAL_NETT = {
  oakdale: [-2337, -2580, 233, -1084],
  malindi: [-2107, 0, 0, 0],
  villeroy: [-5922, -4052, -365, 4352],
  indaba: [-3898, -4063, -3282, 0],
}

const CATEGORY_NAMES = [
  { key: 'income', label: 'Rental Income', color: '#1a2744' },
  { key: 'levy', label: 'Levy', color: '#243356' },
  { key: 'bond', label: 'Bond Payment', color: '#d97706' },
  { key: 'agent', label: 'Letting Agent', color: '#64748b' },
  { key: 'municipal', label: 'Municipal', color: '#e91e8c' },
  { key: 'maintenance', label: 'Maintenance', color: '#dc2626' },
]

function getBudgetKey(name) {
  return name?.toLowerCase().split(' ')[0] || ''
}

export default function Financials() {
  const navigate = useNavigate()
  const location = useLocation()
  const subPath = location.pathname.replace(/^\/financials\/?/, '').split('?')[0] || 'dashboard'
  const activeTab = TABS.find(t => t.key === subPath) ? subPath : 'dashboard'
  const searchParams = new URLSearchParams(location.search)

  const setTab = (key) => {
    if (key === 'dashboard') return navigate('/financials')
    const params = new URLSearchParams()
    if (key === 'ledgers' && ledgerTab !== 'rental_ledger') params.set('tab', ledgerTab)
    if (key === 'ledgers' && ledgerProp) params.set('property_id', ledgerProp)
    const qs = params.toString()
    navigate(`/financials/${key}${qs ? '?' + qs : ''}`)
  }

  const [dash, setDash] = useState(null)
  const [properties, setProperties] = useState([])
  const [allWorkOrders, setAllWorkOrders] = useState([])
  const [allReconciliations, setAllReconciliations] = useState([])
  const [loading, setLoading] = useState(true)

  // Ledger state
  const [ledgerTab, setLedgerTab] = useState(searchParams.get('tab') || 'rental_ledger')
  const [ledgerProp, setLedgerProp] = useState(searchParams.get('property_id') || '')
  const [ledgerEntries, setLedgerEntries] = useState([])
  const fileRef = useRef(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState({})
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [pendingDeleteIds, setPendingDeleteIds] = useState(null)

  // Maintenance state
  const [workOrders, setWorkOrders] = useState([])
  const [woFilter, setWoFilter] = useState('all')
  const [woProp, setWoProp] = useState('')

  // Reconciliation state
  const [reconciliations, setReconciliations] = useState([])
  const [recFilter, setRecFilter] = useState('all')
  const [recProp, setRecProp] = useState('')

  // P&L state
  const [pnlProperty, setPnlProperty] = useState('')
  const [pnlMonth, setPnlMonth] = useState(4)

  useEffect(() => {
    Promise.all([
      get('/dashboard').catch(() => null),
      get('/properties').catch(() => []),
      get('/work-orders?property_id=all').catch(() => []),
      get('/reconciliation?property_id=all').catch(() => []),
    ]).then(([d, p, wo, rec]) => {
      setDash(d)
      setProperties(p)
      setAllWorkOrders(Array.isArray(wo) ? wo : [])
      setAllReconciliations(Array.isArray(rec) ? rec : [])
      setLoading(false)
      if (p.length > 0) {
        const firstId = p[0].id
        if (!ledgerProp) setLedgerProp(firstId)
        if (!woProp) setWoProp(firstId)
        if (!recProp) setRecProp(firstId)
        if (!pnlProperty) setPnlProperty(p[0].name)
      }
    })
  }, [])

  useEffect(() => {
    const pid = ledgerTab === 'bank_ledger' ? 'all' : ledgerProp
    if (pid) {
      get(`/ledger/${ledgerTab}?property_id=${pid}`).then(setLedgerEntries).catch(() => setLedgerEntries([]))
    } else {
      setLedgerEntries([])
    }
  }, [ledgerTab, ledgerProp])

  useEffect(() => {
    if (woProp) {
      const params = new URLSearchParams()
      if (woProp) params.set('property_id', woProp)
      if (woFilter && woFilter !== 'all') params.set('status', woFilter)
      get(`/work-orders?${params.toString()}`).then(setWorkOrders).catch(() => setWorkOrders([]))
    } else {
      setWorkOrders([])
    }
  }, [woFilter, woProp])

  useEffect(() => {
    if (recProp) {
      const params = new URLSearchParams()
      if (recProp) params.set('property_id', recProp)
      if (recFilter && recFilter !== 'all') params.set('status', recFilter)
      get(`/reconciliation?${params.toString()}`).then(setReconciliations).catch(() => setReconciliations([]))
    } else {
      setReconciliations([])
    }
  }, [recFilter, recProp])

  const handleWOStatus = async (id, status) => {
    const updated = await put(`/work-orders/${id}`, { status }).catch(() => null)
    if (updated) setWorkOrders(workOrders.map(w => w.id === id ? updated : w))
  }

  const handleRecUpdate = async (id, data) => {
    const updated = await put(`/reconciliation/${id}`, data).catch(() => null)
    if (updated) setReconciliations(reconciliations.map(r => r.id === id ? updated : r))
  }

  const toggleSelect = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const selectAll = () => {
    const allSelected = ledgerEntries.every(e => selected[e.id])
    const next = {}
    if (!allSelected) ledgerEntries.forEach(e => { next[e.id] = true })
    setSelected(next)
  }

  const handleDeleteSelected = async () => {
    const ids = ledgerEntries.filter(e => selected[e.id]).map(e => e.id)
    if (ids.length === 0) return
    if (ids.length > 3) {
      setPendingDeleteIds(ids)
      setDeleteConfirmInput('')
      return
    }
    if (!confirm(`Delete ${ids.length} transaction${ids.length > 1 ? 's' : ''}?`)) return
    await Promise.all(ids.map(id => del(`/ledger/${ledgerTab}/${id}`).catch(() => {})))
    setLedgerEntries(ledgerEntries.filter(e => !ids.includes(e.id)))
    setSelected({})
  }

  const confirmBulkDelete = async () => {
    if (deleteConfirmInput.toLowerCase() !== 'delete') return
    await Promise.all(pendingDeleteIds.map(id => del(`/ledger/${ledgerTab}/${id}`).catch(() => {})))
    setLedgerEntries(ledgerEntries.filter(e => !pendingDeleteIds.includes(e.id)))
    setSelected({})
    setPendingDeleteIds(null)
    setDeleteConfirmInput('')
  }

  const handleClearLedger = async () => {
    const target = ledgerTab === 'bank_ledger' ? 'all' : ledgerProp
    const label = ledgerTab === 'bank_ledger' ? 'the bank ledger (all properties)' : `the ${LEDGER_LABELS[ledgerTab]} ledger`
    if (!confirm(`Delete ALL transactions in ${label}? This cannot be undone.`)) return
    await del(`/ledger/${ledgerTab}?property_id=${target}`).catch(() => {})
    setLedgerEntries([])
    setSelected({})
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setSelected({})
    setPendingDeleteIds(null)
    setDeleteConfirmInput('')
  }

  const handleCSVImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setImportResult({ error: 'CSV must have a header row and at least one data row' }); return }
      const cols = lines[0].split(',').map(c => c.trim().toLowerCase())
      const dateIdx = cols.findIndex(c => c === 'date')
      const descIdx = cols.findIndex(c => c === 'description' || c === 'desc')
      const debitIdx = cols.findIndex(c => c === 'debit')
      const creditIdx = cols.findIndex(c => c === 'credit')
      const balanceIdx = cols.findIndex(c => c === 'balance')
      const refIdx = cols.findIndex(c => c === 'reference' || c === 'ref')
      if (dateIdx === -1 || descIdx === -1) { setImportResult({ error: 'CSV must have at least "date" and "description" columns' }); return }
      const entries = []
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const debit = parseFloat(vals[debitIdx]) || 0
        const credit = parseFloat(vals[creditIdx]) || 0
        entries.push({
          property_id: ledgerTab === 'bank_ledger' ? 'bank' : ledgerProp,
          date: vals[dateIdx],
          description: vals[descIdx],
          debit: debit < 0 ? Math.abs(debit) : debit,
          credit: credit < 0 ? Math.abs(credit) : credit,
          balance: balanceIdx >= 0 ? (parseFloat(vals[balanceIdx]) || 0) : 0,
          reference: refIdx >= 0 ? vals[refIdx] : null,
        })
      }
      const result = await post(`/ledger/${ledgerTab}`, entries)
      setImportResult(result)
      const refetchPid = ledgerTab === 'bank_ledger' ? 'all' : ledgerProp
      get(`/ledger/${ledgerTab}?property_id=${refetchPid}`).then(setLedgerEntries).catch(() => {})
    } catch (err) {
      setImportResult({ error: err.message })
    }
    setImporting(false)
    e.target.value = ''
  }

  const totalDebit = ledgerEntries.reduce((s, e) => s + (e.debit || 0), 0)
  const totalCredit = ledgerEntries.reduce((s, e) => s + (e.credit || 0), 0)

  const openWO = allWorkOrders.filter(w => w.status === 'open' || w.status === 'in_progress').length
  const exceptions = allReconciliations.filter(r => r.status === 'exception').length
  const matched = allReconciliations.filter(r => r.status === 'matched').length
  const totalWoCost = allWorkOrders.reduce((s, w) => s + (w.cost || 0), 0)

  // ── Chart data ──
  const cashFlowData = {
    labels: MONTHS,
    datasets: [{
      label: 'Net Cash Flow',
      data: [42000, 38500, 41000, 39800, 37500, 42300, 36100, 44700, 41200, 38900, 43500, 40200],
      borderColor: C.green,
      backgroundColor: C.green + '20',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    }]
  }

  const budgetProps = properties.filter(p => NET_BUDGET[getBudgetKey(p.name)])
  const currentMonth = new Date().getMonth()
  const budgetBarData = {
    labels: budgetProps.map(p => p.name),
    datasets: [
      {
        label: 'Budget',
        data: budgetProps.map(p => NET_BUDGET[getBudgetKey(p.name)]?.[currentMonth] || 0),
        backgroundColor: C.navy + '60',
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: budgetProps.map(p => ACTUAL_NETT[getBudgetKey(p.name)]?.[currentMonth] || 0),
        backgroundColor: C.navy,
        borderRadius: 4,
      },
    ]
  }

  const woByProp = {}
  allWorkOrders.forEach(w => {
    if (w.cost) woByProp[w.property_id] = (woByProp[w.property_id] || 0) + w.cost
  })
  const woChartProps = Object.entries(woByProp).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const woOther = Object.entries(woByProp).sort((a, b) => b[1] - a[1]).slice(5).reduce((s, [,v]) => s + v, 0)
  const maintData = {
    labels: [...woChartProps.map(([id]) => properties.find(p => p.id === id)?.name || id.slice(0, 8)), ...(woOther > 0 ? ['Others'] : [])],
    datasets: [{
      data: [...woChartProps.map(([,v]) => v), ...(woOther > 0 ? [woOther] : [])],
      backgroundColor: [C.navy, C.navyL, C.green, C.gold, C.pink, '#93a3b8'],
      borderWidth: 2,
      borderColor: C.bg,
    }]
  }

  const statusCounts = { matched: 0, exception: 0, pending: 0, unmatched: 0 }
  allReconciliations.forEach(r => { if (statusCounts[r.status] !== undefined) statusCounts[r.status]++ })
  const reconData = {
    labels: ['Matched', 'Exception', 'Pending', 'Unmatched'],
    datasets: [{
      data: [statusCounts.matched, statusCounts.exception, statusCounts.pending, statusCounts.unmatched],
      backgroundColor: [C.success, C.danger, C.warn, C.muted],
      borderWidth: 2,
      borderColor: C.bg,
    }]
  }

  const ytdVarianceData = {
    labels: budgetProps.map(p => p.name),
    datasets: [{
      label: 'YTD Variance',
      data: budgetProps.map(p => {
        const key = getBudgetKey(p.name)
        const actuals = ACTUAL_NETT[key] || []
        const budgets = NET_BUDGET[key] || []
        return actuals.reduce((sum, a, i) => sum + (a - (budgets[i] || 0)), 0)
      }),
      backgroundColor: budgetProps.map(p => {
        const key = getBudgetKey(p.name)
        const actuals = ACTUAL_NETT[key] || []
        const budgets = NET_BUDGET[key] || []
        const total = actuals.reduce((sum, a, i) => sum + (a - (budgets[i] || 0)), 0)
        return total >= 0 ? C.success : C.danger
      }),
      borderRadius: 4,
    }]
  }

  const chartOpts = (title) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { boxWidth: 12, usePointStyle: true, padding: 12, font: { size: 11 } } },
      title: { display: !!title, text: title, font: { size: 13, weight: '600' }, padding: { bottom: 8 } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 10 } } },
    },
  })

  if (loading) return <Spinner />

  // ═══════════════════════════════════════
  // SUB-VIEW RENDERERS
  // ═══════════════════════════════════════

  const renderDashboard = () => (
    <div>
      {/* KPI cards */}
      {dash && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard label="Portfolio Value" value={fmtM(dash.totalPortfolioValue || 0)} accent={C.green} />
          <StatCard label="Total Purchase" value={fmtM(dash.totalPurchaseValue || 0)} />
          <StatCard label="Bond Exposure" value={fmtM(dash.totalBondExposure || 0)} accent={C.warn} />
          <StatCard label="Monthly Bond" value={fmt(dash.monthlyBondPayments || 0)} />
          <StatCard label="Net Yield" value={`${dash.netYield || '0.0'}%`} accent={C.green} />
          <StatCard label="Properties" value={dash.propertiesOwned || 0} />
        </div>
      )}

      {/* Operational metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Open Work Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: openWO > 0 ? C.warn : C.success }}>{openWO}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Recon Exceptions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: exceptions > 0 ? C.danger : C.success }}>{exceptions}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Periods Reconciled</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.success }}>{matched}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Total Maintenance Cost</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(totalWoCost)}</div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Cash Flow (12-month)</div>
          {cashFlowData.datasets[0].data.some(v => v !== 0) ? <Line data={cashFlowData} options={chartOpts()} /> : <Empty msg="No cash flow data" />}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Budget vs Actual (MTD)</div>
          {budgetProps.length > 0 ? <Bar data={budgetBarData} options={chartOpts()} /> : <Empty msg="No budget data" />}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Maintenance by Property</div>
          {woChartProps.length > 0 ? <Doughnut data={maintData} options={{ ...chartOpts(), cutout: '60%' }} /> : <Empty msg="No maintenance data" />}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Reconciliation Status</div>
          {allReconciliations.length > 0 ? <Doughnut data={reconData} options={{ ...chartOpts(), cutout: '60%' }} /> : <Empty msg="No reconciliation data" />}
        </div>
      </div>

      {/* Option A: Net budget table */}
      {budgetProps.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Net Budget vs Actual (MTD)
            <span style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>net-only</span>
          </div>
          <div style={{ padding: '0.5rem 0.75rem' }}>
            <Table cols={[
              { key: 'name', label: 'Property' },
              { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text }}>{fmt(NET_BUDGET[getBudgetKey(r.name)]?.[currentMonth] || 0)}</span> },
              { key: 'actual', label: 'Actual', render: r => {
                const a = ACTUAL_NETT[getBudgetKey(r.name)]?.[currentMonth]
                return a !== undefined ? <span style={{ color: C.muted }}>{fmt(a)}</span> : <span style={{ color: C.muted }}>—</span>
              }},
              { key: 'variance', label: 'Variance', render: r => {
                const b = NET_BUDGET[getBudgetKey(r.name)]?.[currentMonth]
                const a = ACTUAL_NETT[getBudgetKey(r.name)]?.[currentMonth]
                if (b === undefined || a === undefined) return <span style={{ color: C.muted }}>—</span>
                const v = a - b
                return <span style={{ color: v >= 0 ? C.success : C.danger, fontWeight: 600 }}>{v >= 0 ? '+' : ''}{fmt(v)}</span>
              }},
            ]} rows={budgetProps} keyFn={r => r.id} />
          </div>
        </div>
      )}

      {/* YTD Variance chart */}
      {budgetProps.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14 }}>YTD Variance by Property</div>
          <div style={{ padding: '1rem' }}>
            <Bar data={ytdVarianceData} options={chartOpts()} />
          </div>
        </div>
      )}

      {/* Per-Property table */}
      <h2 style={{ fontSize: 16, margin: '0 0 0.75rem' }}>Per-Property Overview</h2>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <Table cols={[
            { key: 'name', label: 'Property' },
            { key: 'value', label: 'Market Value', render: r => { const v = r.current_market_value; return v ? fmtM(v) : <span style={{ color: C.muted }}>—</span> } },
            { key: 'purchase', label: 'Purchase', render: r => { const v = r.purchase_price; return v ? fmtM(v) : <span style={{ color: C.muted }}>—</span> } },
            { key: 'wo', label: 'Open Orders', render: r => { const c = allWorkOrders.filter(w => w.property_id === r.id && (w.status === 'open' || w.status === 'in_progress')).length; return <span style={{ color: c > 0 ? C.warn : C.muted }}>{c}</span> } },
            { key: 'recon', label: 'Recon Flags', render: r => { const c = allReconciliations.filter(rec => rec.property_id === r.id && rec.status === 'exception').length; return <span style={{ color: c > 0 ? C.danger : C.muted }}>{c}</span> } },
          ]} rows={properties} keyFn={r => r.id} />
        </div>
      </div>

      {/* Section cards */}
      <h2 style={{ fontSize: 16, margin: '1.5rem 0 0.75rem' }}>Detailed Views</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <div onClick={() => navigate('/financials/ledgers')}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.blue}20` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📒</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Ledgers</div>
          <div style={{ fontSize: 12, color: C.muted }}>View rental, levy, bank & municipality transactions per property</div>
        </div>
        <div onClick={() => navigate('/financials/maintenance')}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.blue}20` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔧</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Maintenance</div>
          <div style={{ fontSize: 12, color: C.muted }}>Track work orders, status updates & maintenance costs</div>
        </div>
      </div>
    </div>
  )

  const renderLedgers = () => (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Select label="Ledger" value={ledgerTab} onChange={v => { setLedgerTab(v); setEditing(false); setSelected({}) }}>
          {LEDGER_TYPES.map(t => <option key={t} value={t}>{LEDGER_LABELS[t] || t}</option>)}
        </Select>
        {ledgerTab !== 'bank_ledger' && (
          <Select label="Property" value={ledgerProp} onChange={setLedgerProp}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        )}
        {ledgerTab === 'bank_ledger' && (
          <div style={{ fontSize: 12, color: C.muted, padding: '0.5rem 0' }}>Bank ledger is shared across all properties</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Btn onClick={() => fileRef.current?.click()} style={{ background: C.green, color: '#fff', fontSize: 12 }}>📄 Import CSV</Btn>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
        {ledgerEntries.length > 0 && editing && (
          <Btn onClick={handleClearLedger} style={{ background: C.danger, color: '#fff', fontSize: 12 }}>🗑 Clear Ledger</Btn>
        )}
        {ledgerEntries.length > 0 && (
          <Btn onClick={() => editing ? handleCancelEdit() : setEditing(true)} style={{ background: C.navyL, color: '#fff', fontSize: 12 }}>
            {editing ? 'Done' : 'Edit'}
          </Btn>
        )}
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Btn onClick={selectAll} style={{ background: 'transparent', color: C.text, border: `1px solid ${C.border}`, fontSize: 11, padding: '0.25rem 0.6rem' }}>
            {ledgerEntries.every(e => selected[e.id]) ? 'Deselect All' : 'Select All'}
          </Btn>
          <Btn onClick={handleDeleteSelected}
            style={{ background: C.danger, color: '#fff', fontSize: 11, padding: '0.25rem 0.6rem', opacity: ledgerEntries.some(e => selected[e.id]) ? 1 : 0.4 }}
            disabled={!ledgerEntries.some(e => selected[e.id])}>
            Delete Selected ({ledgerEntries.filter(e => selected[e.id]).length})
          </Btn>
        </div>
      )}

      {pendingDeleteIds && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '0.75rem', fontSize: 13, background: `${C.danger}15`, border: `1px solid ${C.danger}40` }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: C.danger }}>Confirm delete {pendingDeleteIds.length} transactions</div>
          <div style={{ marginBottom: 6, color: C.muted }}>Type <strong>delete</strong> below:</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={deleteConfirmInput} onChange={e => setDeleteConfirmInput(e.target.value)}
              style={{ padding: '0.35rem 0.6rem', border: `1px solid ${deleteConfirmInput.toLowerCase() === 'delete' ? C.success : C.border}`, borderRadius: 4, fontSize: 13, outline: 'none', width: 120 }} placeholder="type delete" />
            <Btn onClick={confirmBulkDelete}
              style={{ background: deleteConfirmInput.toLowerCase() === 'delete' ? C.danger : C.border, color: '#fff', fontSize: 12, padding: '0.35rem 0.75rem', opacity: deleteConfirmInput.toLowerCase() === 'delete' ? 1 : 0.5 }}
              disabled={deleteConfirmInput.toLowerCase() !== 'delete'}>Confirm</Btn>
            <Btn onClick={() => { setPendingDeleteIds(null); setDeleteConfirmInput('') }}
              style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, fontSize: 12, padding: '0.35rem 0.75rem' }}>Cancel</Btn>
          </div>
        </div>
      )}

      {importResult && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '0.75rem', fontSize: 13,
          background: importResult.error ? `${C.danger}15` : `${C.success}15`, color: importResult.error ? C.danger : C.success,
          border: `1px solid ${importResult.error ? C.danger : C.success}30` }}>
          {importResult.error ? `Import error: ${importResult.error}` : `Imported ${importResult.inserted} entries (${importResult.skipped} skipped)`}
        </div>
      )}

      {importing && <div style={{ fontSize: 13, color: C.muted, marginBottom: '0.75rem' }}>Importing...</div>}

      {ledgerEntries.length === 0 && !importing && <Empty msg="No ledger entries found. Import a CSV to add transactions." />}
      {ledgerEntries.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: 13 }}>
            <span>Entries: <strong>{ledgerEntries.length}</strong></span>
            <span>Total Debit: <strong style={{ color: C.danger }}>{fmt(totalDebit)}</strong></span>
            <span>Total Credit: <strong style={{ color: C.success }}>{fmt(totalCredit)}</strong></span>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Table cols={[
              ...(editing ? [{ key: 'select', label: (
                <input type="checkbox" checked={ledgerEntries.length > 0 && ledgerEntries.every(e => selected[e.id])} onChange={selectAll} style={{ cursor: 'pointer', margin: 0 }} />
              ), render: r => (
                <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleSelect(r.id)} style={{ cursor: 'pointer', margin: 0 }} />
              )}] : []),
              { key: 'date', label: 'Date' },
              { key: 'description', label: 'Description' },
              { key: 'reference', label: 'Ref' },
              { key: 'debit', label: 'Debit', render: r => r.debit > 0 ? <span style={{ color: C.danger }}>{fmt(r.debit)}</span> : '—' },
              { key: 'credit', label: 'Credit', render: r => r.credit > 0 ? <span style={{ color: C.success }}>{fmt(r.credit)}</span> : '—' },
              { key: 'balance', label: 'Balance', render: r => fmt(r.balance) },
            ]} rows={ledgerEntries} keyFn={r => r.id} />
          </div>
        </div>
      )}
    </div>
  )

  const renderPnL = () => {
    const propName = pnlProperty
    const key = getBudgetKey(propName)
    const budget = CATEGORY_BUDGET[key]
    const actualMonth = CATEGORY_ACTUAL[key]?.[pnlMonth]

    if (!budget) return <Empty msg="No budget data for this property. Select a property with budget information." />

    const budgetValues = {}
    let totalBudgetNett = 0
    let totalActualNett = 0
    CATEGORY_NAMES.forEach(c => {
      const b = budget[c.key]?.[pnlMonth] || 0
      const a = actualMonth?.[c.key]
      budgetValues[c.key] = { budget: b, actual: a }
      totalBudgetNett -= b
      totalActualNett -= a ?? b
    })
    // Actually nett = income - expenses, but in the spreadsheet the budget line has specific values
    // Let me just use the pre-computed NET_BUDGET for the nett display
    const netBudget = NET_BUDGET[key]?.[pnlMonth] || 0
    const netActual = ACTUAL_NETT[key]?.[pnlMonth]
    const netVariance = netActual !== undefined ? netActual - netBudget : null

    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Select label="Property" value={propName} onChange={setPnlProperty}>
            {properties.filter(p => CATEGORY_BUDGET[getBudgetKey(p.name)]).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </Select>
          <Select label="Month" value={String(pnlMonth)} onChange={v => setPnlMonth(Number(v))}>
            {MONTH_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </Select>
          <span style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', marginLeft: 'auto' }}>per-category</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ background: C.bg, borderRadius: 6, padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>Budgeted Nett</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(netBudget)}</div>
          </div>
          <div style={{ background: C.bg, borderRadius: 6, padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>Actual Nett</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: netActual !== undefined ? (netActual >= 0 ? C.success : C.danger) : C.muted }}>
              {netActual !== undefined ? fmt(netActual) : '—'}
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 6, padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>Variance</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: netVariance !== null ? (netVariance >= 0 ? C.success : C.danger) : C.muted }}>
              {netVariance !== null ? `${netVariance >= 0 ? '+' : ''}${fmt(netVariance)}` : '—'}
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 6, padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: C.muted }}>YTD Variance</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{
              (() => {
                const actuals = ACTUAL_NETT[key] || []
                const budgets = NET_BUDGET[key] || []
                const ytd = actuals.reduce((sum, a, i) => sum + (a - (budgets[i] || 0)), 0)
                return <span style={{ color: ytd >= 0 ? C.success : C.danger }}>{ytd >= 0 ? '+' : ''}{fmt(ytd)}</span>
              })()
            }</div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14 }}>Income & Expenses — {MONTH_LABELS[pnlMonth]} 2026</div>
          <div style={{ padding: '0.5rem 0.75rem' }}>
            <Table cols={[
              { key: 'category', label: 'Category' },
              { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text }}>{fmt(budgetValues[r.key]?.budget || 0)}</span> },
              { key: 'actual', label: 'Actual', render: r => {
                const a = budgetValues[r.key]?.actual
                return a !== undefined ? <span style={{ color: C.muted }}>{fmt(a)}</span> : <span style={{ color: C.muted }}>—</span>
              }},
              { key: 'variance', label: 'Variance', render: r => {
                const b = budgetValues[r.key]?.budget || 0
                const a = budgetValues[r.key]?.actual
                if (a === undefined) return <span style={{ color: C.muted }}>—</span>
                const v = b - a // positive = under budget (good for expenses)
                // For income categories (income, levy): positive variance = good
                // For expense categories (bond, agent, municipal, maintenance): negative = spent more
                const isExpense = ['bond', 'agent', 'municipal', 'maintenance'].includes(r.key)
                const showGood = isExpense ? v >= 0 : v <= 0
                const displayV = isExpense ? v : -v
                return <span style={{ color: showGood ? C.success : C.danger, fontWeight: 600 }}>{displayV >= 0 ? '+' : ''}{fmt(displayV)}</span>
              }},
              { key: 'bar', label: '', render: r => {
                const b = budgetValues[r.key]?.budget || 1
                const a = budgetValues[r.key]?.actual
                if (a === undefined) return null
                const pct = Math.min(Math.abs(a / b), 1.5)
                const over = a > b && ['bond', 'agent', 'municipal', 'maintenance'].includes(r.key)
                const under = a < b && !['bond', 'agent', 'municipal', 'maintenance'].includes(r.key)
                const bad = over || under
                return (
                  <span style={{ display: 'inline-block', width: 60, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden', verticalAlign: 'middle' }}>
                    <span style={{ display: 'block', height: '100%', width: `${Math.round(pct * 100)}%`, background: bad ? C.danger : C.success, borderRadius: 3 }} />
                  </span>
                )
              }},
            ]} rows={CATEGORY_NAMES} keyFn={r => r.key} />
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontWeight: 600, fontSize: 14 }}>Monthly Trend — {propName}</div>
          <div style={{ padding: '0.5rem 0.75rem', overflowX: 'auto' }}>
            <Table cols={[
              { key: 'month', label: 'Month' },
              { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text }}>{fmt(NET_BUDGET[key]?.[r.monthIdx] || 0)}</span> },
              { key: 'actual', label: 'Actual', render: r => {
                const a = ACTUAL_NETT[key]?.[r.monthIdx]
                return a !== undefined ? <span style={{ color: C.muted }}>{fmt(a)}</span> : <span style={{ color: C.muted }}>—</span>
              }},
              { key: 'variance', label: 'Variance', render: r => {
                const b = NET_BUDGET[key]?.[r.monthIdx]
                const a = ACTUAL_NETT[key]?.[r.monthIdx]
                if (b === undefined || a === undefined) return <span style={{ color: C.muted }}>—</span>
                const v = a - b
                return <span style={{ color: v >= 0 ? C.success : C.danger, fontWeight: 600 }}>{v >= 0 ? '+' : ''}{fmt(v)}</span>
              }},
            ]} rows={MONTH_LABELS.map((l, i) => ({ month: l, monthIdx: i }))} keyFn={r => r.monthIdx} />
          </div>
        </div>
      </div>
    )
  }

  const renderMaintenance = () => (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Select label="Property" value={woProp} onChange={setWoProp}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Status" value={woFilter} onChange={setWoFilter}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      {workOrders.length === 0 ? <Empty msg="No maintenance work orders found." /> : (
        <Table cols={[
          { key: 'raised_at', label: 'Raised', render: r => r.raised_at ? r.raised_at.slice(0, 10) : '—' },
          { key: 'property_id', label: 'Property', render: r => properties.find(p => p.id === r.property_id)?.name || r.property_id },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status', render: r => (
            <Select value={r.status} onChange={v => handleWOStatus(r.id, v)}>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          )},
          { key: 'cost', label: 'Cost', render: r => r.cost ? fmt(r.cost) : '—' },
        ]} rows={workOrders} keyFn={r => r.id} />
      )}
    </div>
  )

  const renderReconciliation = () => (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Select label="Property" value={recProp} onChange={setRecProp}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Status" value={recFilter} onChange={setRecFilter}>
          <option value="all">All</option>
          <option value="matched">Matched</option>
          <option value="unmatched">Unmatched</option>
          <option value="pending">Pending</option>
          <option value="exception">Exception</option>
        </Select>
      </div>
      {reconciliations.length === 0 ? <Empty msg="No reconciliation entries found." /> : (
        <Table cols={[
          { key: 'period', label: 'Period' },
          { key: 'rental_amount', label: 'Rental', render: r => r.rental_amount ? fmt(r.rental_amount) : '—' },
          { key: 'bank_amount', label: 'Bank', render: r => r.bank_amount ? fmt(r.bank_amount) : '—' },
          { key: 'variance', label: 'Variance', render: r => <span style={{ color: (r.variance || 0) !== 0 ? C.danger : C.success }}>{fmt(r.variance || 0)}</span> },
          { key: 'status', label: 'Status', render: r => (
            <Select value={r.status} onChange={v => handleRecUpdate(r.id, { status: v })}>
              <option value="matched">Matched</option>
              <option value="unmatched">Unmatched</option>
              <option value="pending">Pending</option>
              <option value="exception">Exception</option>
            </Select>
          )},
          { key: 'notes', label: 'Notes', render: r => (
            <input defaultValue={r.notes || ''} onBlur={e => handleRecUpdate(r.id, { notes: e.target.value })}
              style={{ padding: '0.25rem 0.5rem', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, width: 120 }} />
          )},
        ]} rows={reconciliations} keyFn={r => r.id} />
      )}
    </div>
  )

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════
  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 20, margin: '0 0 0.25rem' }}>Financials</h1>
      <p style={{ margin: '0 0 1.25rem', color: C.muted, fontSize: 13 }}>
        {activeTab === 'dashboard' ? 'Portfolio-wide financial dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '0.6rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? C.navy : C.muted,
              borderBottom: activeTab === t.key ? `2px solid ${C.navy}` : '2px solid transparent',
              marginBottom: -2, whiteSpace: 'nowrap',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'ledgers' && renderLedgers()}
      {activeTab === 'pnl' && renderPnL()}
      {activeTab === 'maintenance' && renderMaintenance()}
      {activeTab === 'reconciliation' && renderReconciliation()}
    </div>
  )
}
