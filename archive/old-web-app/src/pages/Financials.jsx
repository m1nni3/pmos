import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { get, put, post, del } from '../api'
import { C, fmt, R, T, SHADOW, EASE } from '../styles'
import { Spinner, Empty, Table, Btn, Select } from '../components/UI'
import SummaryMetrics from '../components/SummaryMetrics'
import DetailPanel from '../components/DetailPanel'
import { usePageTitle } from '../PageTitleContext'
import { useAuth } from '../AuthContext'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

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

const NET_BUDGET = {
  oakdale: [-2949, -2949, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696, -1696],
  malindi: [1760, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993, 1993],
  villeroy: [23, 23, -80, -80, -80, -80, -80, -80, -80, -80, -80, -80],
  indaba: [-142, -142, -142, 71, 71, 71, 71, 71, 71, 71, 71, 71],
}

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
  { key: 'income', label: 'Rental Income', color: C.primary },
  { key: 'levy', label: 'Levy', color: C.navy },
  { key: 'bond', label: 'Bond Payment', color: C.warn },
  { key: 'agent', label: 'Letting Agent', color: C.muted },
  { key: 'municipal', label: 'Municipal', color: C.pink },
  { key: 'maintenance', label: 'Maintenance', color: C.danger },
]

function getBudgetKey(name) {
  return name?.toLowerCase().split(' ')[0] || ''
}

function fmtLocal(n) {
  if (n == null) return '\u2014'
  const v = Math.round(Number(n))
  if (v >= 1000) return `R${v.toLocaleString()}`
  return `R${v}`
}

const RECON_TABS = [
  { id: 'levy', label: 'Levy Verification' },
  { id: 'rental', label: 'Rental Verification' },
  { id: 'municipal', label: 'Municipal Verification' },
]

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

const chartBox = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.lg, padding: '1rem' }
const chartTitle = { fontWeight: 600, fontSize: T.sm, marginBottom: 10, color: C.text }

export default function Financials({ finTab: activeTab, setFinTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setPageTitle, setPageSubtitle } = usePageTitle()
  const { isAdmin } = useAuth()

  const setTab = (key) => {
    setFinTab(key)
    if (key === 'dashboard') return navigate('/financials')
    navigate(`/financials/${key}`)
  }

  const [dash, setDash] = useState(null)
  const [properties, setProperties] = useState([])
  const [allWorkOrders, setAllWorkOrders] = useState([])
  const [allReconciliations, setAllReconciliations] = useState([])
  const [loading, setLoading] = useState(true)

  const [ledgerTab, setLedgerTab] = useState('rental_ledger')
  const [ledgerProp, setLedgerProp] = useState('')
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const fileRef = useRef(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState({})
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [pendingDeleteIds, setPendingDeleteIds] = useState(null)

  const [workOrders, setWorkOrders] = useState([])
  const [woFilter, setWoFilter] = useState('all')
  const [woProp, setWoProp] = useState('')

  const [recTab, setRecTab] = useState('levy')
  const [recSelected, setRecSelected] = useState(null)

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
        if (!pnlProperty) setPnlProperty(p[0].name)
      }
    })
  }, [])

  useEffect(() => {
    const pid = ledgerTab === 'bank_ledger' ? 'all' : ledgerProp
    if (pid) {
      const params = new URLSearchParams({ property_id: pid })
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      get(`/ledger/${ledgerTab}?${params.toString()}`).then(setLedgerEntries).catch(() => setLedgerEntries([]))
    } else {
      setLedgerEntries([])
    }
  }, [ledgerTab, ledgerProp, dateFrom, dateTo])

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

  const handleWOStatus = async (id, status) => {
    const updated = await put(`/work-orders/${id}`, { status }).catch(() => null)
    if (updated) setWorkOrders(workOrders.map(w => w.id === id ? updated : w))
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

  const budgetProps = properties.filter(p => NET_BUDGET[getBudgetKey(p.name)])
  const currentMonth = new Date().getMonth()
  const budgetBarData = {
    labels: budgetProps.map(p => p.name),
    datasets: [
      {
        label: 'Budget',
        data: budgetProps.map(p => NET_BUDGET[getBudgetKey(p.name)]?.[currentMonth] || 0),
        backgroundColor: C.primary + '60',
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: budgetProps.map(p => ACTUAL_NETT[getBudgetKey(p.name)]?.[currentMonth] || 0),
        backgroundColor: C.primary,
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
      backgroundColor: [C.primary, C.navy, C.green, C.warn, C.pink, '#94a3b8'],
      borderWidth: 2,
      borderColor: C.card,
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
      borderColor: C.card,
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
      y: { grid: { color: C.borderLight }, ticks: { font: { size: 10 } } },
    },
  })

  if (loading) return <Spinner />

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={chartBox}>
          <div style={chartTitle}>Budget vs Actual (MTD)</div>
          {budgetProps.length > 0 ? <Bar data={budgetBarData} options={chartOpts()} /> : <Empty msg="No budget data" />}
        </div>
        <div style={chartBox}>
          <div style={chartTitle}>Maintenance by Property</div>
          {woChartProps.length > 0 ? <Doughnut data={maintData} options={{ ...chartOpts(), cutout: '60%' }} /> : <Empty msg="No maintenance data" />}
        </div>
        <div style={chartBox}>
          <div style={chartTitle}>Reconciliation Status</div>
          {allReconciliations.length > 0 ? <Doughnut data={reconData} options={{ ...chartOpts(), cutout: '60%' }} /> : <Empty msg="No reconciliation data" />}
        </div>
      </div>

      {budgetProps.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ ...chartBox }}>
            <div style={{ padding: '0 0 0.75rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: T.sm, display: 'flex', alignItems: 'center', gap: 8 }}>
              Net Budget vs Actual (MTD)
              <span style={{ fontSize: 10, color: C.muted, background: C.borderLight, padding: '0.1rem 0.4rem', borderRadius: R.sm, fontWeight: 600, textTransform: 'uppercase' }}>net-only</span>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <Table cols={[
                { key: 'name', label: 'Property' },
                { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text }}>{fmt(NET_BUDGET[getBudgetKey(r.name)]?.[currentMonth] || 0)}</span> },
                { key: 'actual', label: 'Actual', render: r => {
                  const a = ACTUAL_NETT[getBudgetKey(r.name)]?.[currentMonth]
                  return a !== undefined ? <span style={{ color: C.textSecondary }}>{fmt(a)}</span> : <span style={{ color: C.muted }}>—</span>
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
          <div style={{ ...chartBox }}>
            <div style={{ padding: '0 0 0.75rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: T.sm }}>YTD Variance by Property</div>
            <div style={{ paddingTop: '1rem' }}>
              <Bar data={ytdVarianceData} options={chartOpts()} />
            </div>
          </div>
        </div>
      )}

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
        {/* Date range filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ height: 32, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#111827', outline: 'none', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ height: 32, padding: '0 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#111827', outline: 'none', cursor: 'pointer' }} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            style={{ height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, color: '#6b7280', cursor: 'pointer', alignSelf: 'flex-end' }}>
            Clear
          </button>
        )}
        {ledgerTab === 'bank_ledger' && (
          <div style={{ fontSize: T.xs, color: C.muted, padding: '0.5rem 0' }}>Bank ledger is shared across all properties</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {isAdmin && (
          <>
            <Btn onClick={() => fileRef.current?.click()} variant="secondary" size="sm">Import CSV</Btn>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
            {ledgerEntries.length > 0 && editing && (
              <Btn onClick={handleClearLedger} variant="danger" size="sm">Clear Ledger</Btn>
            )}
            {ledgerEntries.length > 0 && (
              <Btn onClick={() => editing ? handleCancelEdit() : setEditing(true)} variant="secondary" size="sm">
                {editing ? 'Done' : 'Edit'}
              </Btn>
            )}
          </>
        )}
      </div>

      {isAdmin && editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Btn onClick={selectAll} variant="ghost" size="sm">
            {ledgerEntries.every(e => selected[e.id]) ? 'Deselect All' : 'Select All'}
          </Btn>
          <Btn onClick={handleDeleteSelected} variant="danger" size="sm"
            disabled={!ledgerEntries.some(e => selected[e.id])}>
            Delete Selected ({ledgerEntries.filter(e => selected[e.id]).length})
          </Btn>
        </div>
      )}

      {isAdmin && pendingDeleteIds && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: R.lg, marginBottom: '0.75rem', fontSize: T.sm, background: C.dangerLight, border: `1px solid ${C.danger}` }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: C.danger }}>Confirm delete {pendingDeleteIds.length} transactions</div>
          <div style={{ marginBottom: 6, color: C.textSecondary }}>Type <strong>delete</strong> below:</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={deleteConfirmInput} onChange={e => setDeleteConfirmInput(e.target.value)}
              style={{ height: 32, padding: '0 0.6rem', border: `1px solid ${deleteConfirmInput.toLowerCase() === 'delete' ? C.success : C.border}`, borderRadius: R.md, fontSize: T.sm, outline: 'none', width: 120 }}
              placeholder="type delete" />
            <Btn onClick={confirmBulkDelete} variant="danger" size="sm"
              disabled={deleteConfirmInput.toLowerCase() !== 'delete'}>Confirm</Btn>
            <Btn onClick={() => { setPendingDeleteIds(null); setDeleteConfirmInput('') }} variant="ghost" size="sm">Cancel</Btn>
          </div>
        </div>
      )}

      {importResult && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: R.md, marginBottom: '0.75rem', fontSize: T.sm,
          background: importResult.error ? C.dangerLight : C.greenLight,
          color: importResult.error ? C.danger : C.success,
          border: `1px solid ${importResult.error ? C.danger : C.success}30` }}>
          {importResult.error ? `Import error: ${importResult.error}` : `Imported ${importResult.inserted} entries (${importResult.skipped} skipped)`}
        </div>
      )}

      {importing && <div style={{ fontSize: T.sm, color: C.muted, marginBottom: '0.75rem' }}>Importing...</div>}

      {ledgerEntries.length === 0 && !importing && <Empty msg="No ledger entries found. Import a CSV to add transactions." />}
      {ledgerEntries.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: T.sm, color: C.textSecondary }}>
            <span>Entries: <strong style={{ color: C.text }}>{ledgerEntries.length}</strong></span>
            <span>Total Debit: <strong style={{ color: C.danger }}>{fmt(totalDebit)}</strong></span>
            <span>Total Credit: <strong style={{ color: C.success }}>{fmt(totalCredit)}</strong></span>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto', border: `1px solid ${C.borderLight}`, borderRadius: R.lg }}>
            <Table cols={[
              ...(isAdmin && editing ? [{ key: 'select', label: (
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
    const netBudget = NET_BUDGET[key]?.[pnlMonth] || 0
    const netActual = ACTUAL_NETT[key]?.[pnlMonth]
    const netVariance = netActual !== undefined ? netActual - netBudget : null

    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Select label="Property" value={propName} onChange={setPnlProperty}>
            {properties.filter(p => CATEGORY_BUDGET[getBudgetKey(p.name)]).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </Select>
          <Select label="Month" value={String(pnlMonth)} onChange={v => setPnlMonth(Number(v))}>
            {MONTH_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </Select>
          <span style={{ fontSize: 9, color: C.muted, background: C.borderLight, padding: '0.1rem 0.35rem', borderRadius: R.sm, fontWeight: 600, textTransform: 'uppercase', marginLeft: 'auto' }}>per-category</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <div style={{ background: C.borderLight, borderRadius: R.md, padding: '0.3rem 0.6rem' }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: C.muted }}>Budgeted Nett</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(netBudget)}</div>
          </div>
          <div style={{ background: C.borderLight, borderRadius: R.md, padding: '0.3rem 0.6rem' }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: C.muted }}>Actual Nett</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: netActual !== undefined ? (netActual >= 0 ? C.success : C.danger) : C.muted }}>
              {netActual !== undefined ? fmt(netActual) : '—'}
            </div>
          </div>
          <div style={{ background: C.borderLight, borderRadius: R.md, padding: '0.3rem 0.6rem' }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: C.muted }}>Variance</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: netVariance !== null ? (netVariance >= 0 ? C.success : C.danger) : C.muted }}>
              {netVariance !== null ? `${netVariance >= 0 ? '+' : ''}${fmt(netVariance)}` : '—'}
            </div>
          </div>
          <div style={{ background: C.borderLight, borderRadius: R.md, padding: '0.3rem 0.6rem' }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: C.muted }}>YTD Variance</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {(() => {
                const actuals = ACTUAL_NETT[key] || []
                const budgets = NET_BUDGET[key] || []
                const ytd = actuals.reduce((sum, a, i) => sum + (a - (budgets[i] || 0)), 0)
                return <span style={{ color: ytd >= 0 ? C.success : C.danger }}>{ytd >= 0 ? '+' : ''}{fmt(ytd)}</span>
              })()}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0' }}>
          <div style={{ ...chartBox, padding: '0.6rem' }}>
            <div style={{ padding: '0 0 0.4rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: 11 }}>Income & Expenses — {MONTH_LABELS[pnlMonth]} 2026</div>
            <div style={{ paddingTop: '0.25rem' }}>
              <Table cols={[
                { key: 'category', label: 'Category', render: r => r.label },
                { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text, fontSize: 11 }}>{fmt(budgetValues[r.key]?.budget || 0)}</span> },
                { key: 'actual', label: 'Actual', render: r => {
                  const a = budgetValues[r.key]?.actual
                  return a !== undefined ? <span style={{ color: C.textSecondary, fontSize: 11 }}>{fmt(a)}</span> : <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                }},
                { key: 'variance', label: 'Variance', render: r => {
                  const b = budgetValues[r.key]?.budget || 0
                  const a = budgetValues[r.key]?.actual
                  if (a === undefined) return <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                  const v = b - a
                  const isExpense = ['bond', 'agent', 'municipal', 'maintenance'].includes(r.key)
                  const showGood = isExpense ? v >= 0 : v <= 0
                  const displayV = isExpense ? v : -v
                  return <span style={{ color: showGood ? C.success : C.danger, fontWeight: 600, fontSize: 11 }}>{displayV >= 0 ? '+' : ''}{fmt(displayV)}</span>
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
                    <span style={{ display: 'inline-block', width: 40, height: 5, background: C.border, borderRadius: 3, overflow: 'hidden', verticalAlign: 'middle' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.round(pct * 100)}%`, background: bad ? C.danger : C.success, borderRadius: 3 }} />
                    </span>
                  )
                }},
              ]} rows={CATEGORY_NAMES} keyFn={r => r.key} />
            </div>
          </div>

          <div style={{ ...chartBox, padding: '0.6rem' }}>
            <div style={{ padding: '0 0 0.4rem', borderBottom: `1px solid ${C.borderLight}`, fontWeight: 600, fontSize: 11 }}>Monthly Trend — {propName}</div>
            <div style={{ paddingTop: '0.25rem', overflowX: 'auto' }}>
              <Table cols={[
                { key: 'month', label: 'Month' },
                { key: 'budget', label: 'Budget', render: r => <span style={{ color: C.text, fontSize: 11 }}>{fmt(NET_BUDGET[key]?.[r.monthIdx] || 0)}</span> },
                { key: 'actual', label: 'Actual', render: r => {
                  const a = ACTUAL_NETT[key]?.[r.monthIdx]
                  return a !== undefined ? <span style={{ color: C.textSecondary, fontSize: 11 }}>{fmt(a)}</span> : <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                }},
                { key: 'variance', label: 'Variance', render: r => {
                  const b = NET_BUDGET[key]?.[r.monthIdx]
                  const a = ACTUAL_NETT[key]?.[r.monthIdx]
                  if (b === undefined || a === undefined) return <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                  const v = a - b
                  return <span style={{ color: v >= 0 ? C.success : C.danger, fontWeight: 600, fontSize: 11 }}>{v >= 0 ? '+' : ''}{fmt(v)}</span>
                }},
              ]} rows={MONTH_LABELS.map((l, i) => ({ month: l, monthIdx: i }))} keyFn={r => r.monthIdx} />
            </div>
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
          { key: 'due_date', label: 'Due', render: r => r.due_date
            ? <span style={{ color: new Date(r.due_date) < new Date() && r.status !== 'completed' ? '#dc2626' : '#111827', fontWeight: r.due_date && new Date(r.due_date) < new Date() ? 600 : 400 }}>{r.due_date}</span>
            : <span style={{ color: '#9ca3af' }}>—</span>
          },
          { key: 'priority', label: 'Priority', render: r => {
            const colors = { high: ['#fef2f2','#dc2626'], medium: ['#fffbeb','#d97706'], low: ['#f0fdf4','#16a34a'] }
            const [bg, fg] = colors[r.priority] || ['#f9fafb','#6b7280']
            return r.priority
              ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: bg, color: fg, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{r.priority}</span>
              : <span style={{ color: '#9ca3af' }}>—</span>
          }},
          { key: 'property_id', label: 'Property', render: r => properties.find(p => p.id === r.property_id)?.name || r.property_id },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status', render: r => isAdmin ? (
            <Select value={r.status} onChange={v => handleWOStatus(r.id, v)}>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          ) : (
            <span style={{ textTransform: 'capitalize' }}>{r.status.replace(/_/g, ' ')}</span>
          )},
          { key: 'cost', label: 'Cost', render: r => r.cost ? fmt(r.cost) : '—' },
        ]} rows={workOrders} keyFn={r => r.id} />
      )}
    </div>
  )

  function ReconDetailContent({ record, tab }) {
    if (!record) return null

    if (tab === 'levy') {
      const v = Number(record.variance)
      return (
        <>
          <div className="rec-detail-section">
            <h4>Verification Summary</h4>
            <div className="rec-detail-row"><span className="lbl">Period</span><span className="val">{record.period_display || record.period}</span></div>
            <div className="rec-detail-row"><span className="lbl">Agent Claims Paid</span><span className="val">{fmtLocal(record.rental_amount)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Body Corp Received</span><span className="val">{fmtLocal(record.bank_amount)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmtLocal(v)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
          </div>
          {record.status === 'exception' && (
            <div className="rec-detail-section">
              <h4>Exception Details</h4>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>
                Variance of {fmtLocal(Math.abs(v))} between agent claims and body corp receipts. Requires investigation.
              </div>
            </div>
          )}
        </>
      )
    }

    if (tab === 'rental') {
      const v = Number(record.rent_due) - Number(record.rent_collected)
      return (
        <>
          <div className="rec-detail-section">
            <h4>Unit Summary</h4>
            <div className="rec-detail-row"><span className="lbl">Unit</span><span className="val">{record.unit_number}</span></div>
            <div className="rec-detail-row"><span className="lbl">Tenant</span><span className="val">{record.tenant_name}</span></div>
            <div className="rec-detail-row"><span className="lbl">Rent Due</span><span className="val">{fmtLocal(record.rent_due)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Rent Collected</span><span className="val">{fmtLocal(record.rent_collected)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Deposit Held</span><span className="val">{fmtLocal(record.deposit)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmtLocal(v)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
          </div>
        </>
      )
    }

    if (tab === 'municipal') {
      const v = Number(record.variance)
      return (
        <>
          <div className="rec-detail-section">
            <h4>Verification Summary</h4>
            <div className="rec-detail-row"><span className="lbl">Period</span><span className="val">{record.period}</span></div>
            <div className="rec-detail-row"><span className="lbl">Municipal Charged</span><span className="val">{fmtLocal(record.municipal_charged)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Agent Collected</span><span className="val">{fmtLocal(record.agent_collected)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Paid to Municipal</span><span className="val">{fmtLocal(record.paid_to_municipal)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Variance</span><span className={`val variance${v < 0 ? ' negative' : v > 0 ? ' positive' : ''}`}>{fmtLocal(v)}</span></div>
            <div className="rec-detail-row"><span className="lbl">Status</span><span className="val"><span className={`status ${record.status}`}>{record.status}</span></span></div>
          </div>
          {record.status === 'exception' && (
            <div className="rec-detail-section">
              <h4>Exception Details</h4>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>
                {fmtLocal(Math.abs(v))} collected but not remitted to municipality.
              </div>
            </div>
          )}
        </>
      )
    }

    return null
  }

  const renderReconciliation = () => {
    const colMap = { levy: LEVY_COLUMNS, rental: RENTAL_COLUMNS, municipal: MUNICIPAL_COLUMNS }
    const dataMap = {
      levy: allReconciliations.map(r => ({
        ...r,
        period_display: r.period?.includes('-')
          ? (() => { const [y, m] = r.period.split('-'); return `${MONTH_LABELS[parseInt(m) - 1]} ${y}` })()
          : r.period
      })),
      rental: SEED_RENTAL,
      municipal: SEED_MUNICIPAL,
    }
    const rows = dataMap[recTab]
    const cols = colMap[recTab]
    const record = rows.find(r => r.id === recSelected) || null

    const exceptionCount = rows.filter(r => r.status === 'exception').length
    const matchedCount = rows.filter(r => r.status === 'matched' || r.status === 'verified').length
    const totalVariance = rows.reduce((s, r) => {
      if (recTab === 'levy') return s + Number(r.variance || 0)
      if (recTab === 'rental') return s + (Number(r.rent_due) - Number(r.rent_collected))
      if (recTab === 'municipal') return s + Number(r.variance || 0)
      return s
    }, 0)

    const metrics = [
      { label: 'Total Records', value: String(rows.length) },
      { label: 'Matched', value: String(matchedCount) },
      { label: 'Exceptions', value: String(exceptionCount) },
      { label: 'Net Variance', value: fmtLocal(totalVariance) },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {RECON_TABS.map(t => (
            <div key={t.id}
              className={`detail-tab${recTab === t.id ? ' active' : ''}`}
              onClick={() => { setRecTab(t.id); setRecSelected(null) }}>
              {t.label}
            </div>
          ))}
        </div>
        <SummaryMetrics metrics={metrics} />
        <div className="rec-workspace">
          <div className="rec-master">
            <div style={{ overflow: 'auto', flex: 1 }}>
              <table className="rec-data-table">
                <thead>
                  <tr>
                    {cols.map(col => <th key={col.key}>{col.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={cols.length} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, cursor: 'default' }}>No records found</td></tr>
                  ) : (
                    rows.map(row => (
                      <tr key={row.id} className={recSelected === row.id ? 'selected' : ''} onClick={() => setRecSelected(row.id)}>
                        {cols.map(col => {
                          if (col.key === 'status') {
                            return <td key={col.key}><span className={`status ${row.status}`}>{row.status}</span></td>
                          }
                          if (col.key === 'period') {
                            return <td key={col.key}>{row.period_display || row.period}</td>
                          }
                          if (['rental_amount', 'bank_amount', 'variance', 'rent_due', 'rent_collected', 'deposit', 'municipal_charged', 'agent_collected', 'paid_to_municipal'].includes(col.key)) {
                            const val = Number(row[col.key])
                            const cls = col.key === 'variance' ? (val < 0 ? 'negative' : val > 0 ? 'positive' : '') : ''
                            return <td key={col.key} className={cls || undefined}>{fmtLocal(val)}</td>
                          }
                          return <td key={col.key}>{row[col.key]}</td>
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <DetailPanel title={record ? (record.period_display || record.period || record.unit_number || '') : 'Verification'} accentTag={record ? record.status : null}>
            <ReconDetailContent record={record} tab={recTab} />
          </DetailPanel>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 28px', maxWidth: 1200 }}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'ledgers' && renderLedgers()}
      {activeTab === 'pnl' && renderPnL()}
      {activeTab === 'maintenance' && renderMaintenance()}
      {activeTab === 'reconciliation' && renderReconciliation()}
    </div>
  )
}
