import { useState, useEffect, useMemo } from 'react'
import { FONT } from '../styles'
import { get, post, put, del } from '../api'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const fmt = n => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n || 0)
const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return d } }

const PALETTE = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4','#a855f7']

export default function PettyCash() {
  const [data, setData] = useState({ income: [], expenses: [], balance: 0, total_income: 0, total_expenses: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [editMode, setEditMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [action, setAction] = useState(null) // { type: 'edit'|'delete', item }
  const [showAdd, setShowAdd] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, text: '' })
  const [editExplain, setEditExplain] = useState({ open: false, item: null, explanation: '' })

  const load = () => {
    setLoading(true)
    get('/petty-cash').then(setData).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleSel = id => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const clearSel = () => { setSelected(new Set()); setEditMode(false) }

  const isOlderThan48h = item => {
    const created = new Date(item.created_at || item.date)
    return (Date.now() - created.getTime()) > 48 * 60 * 60 * 1000
  }

  const handleEdit = item => {
    if (isOlderThan48h(item)) setEditExplain({ open: true, item, explanation: '' })
    else setAction({ type: 'edit', item })
  }
  const confirmEditExplain = () => {
    setAction({ type: 'edit', item: editExplain.item, explanation: editExplain.explanation })
    setEditExplain({ open: false, item: null, explanation: '' })
  }

  const handleDelete = item => setDeleteConfirm({ open: true, item, text: '' })
  const confirmDelete = async () => {
    if (deleteConfirm.text !== 'delete') return
    const item = deleteConfirm.item
    const endpoint = item.total !== undefined ? `/petty-cash/income/${item.id}` : `/petty-cash/expenses/${item.id}`
    await del(endpoint)
    setDeleteConfirm({ open: false, item: null, text: '' })
    setSelected(new Set()); setEditMode(false); load()
  }

  const expenseByType = useMemo(() => {
    const map = {}
    data.expenses.forEach(e => { map[e.type || 'Other'] = (map[e.type || 'Other'] || 0) + (e.incl_vat || 0) })
    return map
  }, [data.expenses])

  const expenseByProperty = useMemo(() => {
    const map = {}
    data.expenses.forEach(e => { map[e.property || 'Unassigned'] = (map[e.property || 'Unassigned'] || 0) + (e.incl_vat || 0) })
    return map
  }, [data.expenses])

  const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'detailed', label: 'Detailed' }]

  return (
    <div style={{ fontFamily: FONT, padding: '20px 24px', color: '#e5e7eb', maxWidth: 1200, minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M12 14h4"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Petty Cash Tracker</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>TaskWhizz · Income & Expenses</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editMode && (
            <>
              <button onClick={() => { if (selected.size > 0) { const items = data.expenses.concat(data.income).filter(i => selected.has(i.id)); if (items.length === 1) handleEdit(items[0]) } }} disabled={selected.size !== 1} style={{ ...btnStyle, background: selected.size === 1 ? '#3b82f6' : 'rgba(255,255,255,0.06)', color: selected.size === 1 ? '#fff' : 'rgba(255,255,255,0.2)', cursor: selected.size === 1 ? 'pointer' : 'not-allowed' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
              <button onClick={() => { if (selected.size > 0) { const items = data.expenses.concat(data.income).filter(i => selected.has(i.id)); if (items.length === 1) handleDelete(items[0]) } }} disabled={selected.size !== 1} style={{ ...btnStyle, background: selected.size === 1 ? '#ef4444' : 'rgba(255,255,255,0.06)', color: selected.size === 1 ? '#fff' : 'rgba(255,255,255,0.2)', cursor: selected.size === 1 ? 'pointer' : 'not-allowed' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete ({selected.size})
              </button>
              <button onClick={clearSel} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
            </>
          )}
          {!editMode && (
            <button onClick={() => setEditMode(true)} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Mode
            </button>
          )}
          <button onClick={() => setShowAdd(true)} style={{ ...btnStyle, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)',
            background: tab === t.key ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
            border: '1px solid', borderColor: tab === t.key ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
            borderRadius: t.key === 'overview' ? '8px 0 0 8px' : '0 8px 8px 0',
            cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>}

      {/* Overview Tab */}
      {!loading && tab === 'overview' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} label="Total Income" value={fmt(data.total_income)} color="#22c55e" bg="rgba(34,197,94,0.08)" />
            <Card icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} label="Total Expenses" value={fmt(data.total_expenses)} color="#ef4444" bg="rgba(239,68,68,0.08)" />
            <Card icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>} label="Balance" value={fmt(data.balance)} color={data.balance >= 0 ? '#3b82f6' : '#f59e0b'} bg={data.balance >= 0 ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)'} />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="Expense by Category" data={expenseByType} />
            <ChartCard title="Expense by Property" data={expenseByProperty} />
          </div>
        </div>
      )}

      {/* Detailed Tab */}
      {!loading && tab === 'detailed' && (
        <div>
          {/* Income Section */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Income ({data.income.length})
          </h3>
          <DataTable
            columns={['', 'Date', 'Description', 'Total']}
            rows={data.income.map(i => [
              editMode && <Check checked={selected.has(i.id)} onChange={() => toggleSel(i.id)} />,
              fmtDate(i.date),
              i.description,
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{fmt(i.total)}</span>,
            ])}
            editMode={editMode}
          />

          {/* Expense Section */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', margin: '24px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Expenses ({data.expenses.length})
          </h3>
          <DataTable
            columns={['', 'Date', 'Property', 'Vendor', 'Type', 'Description', 'Excl. VAT', 'VAT', 'Incl. VAT', 'Receipt']}
            rows={data.expenses.map(e => [
              editMode && <Check checked={selected.has(e.id)} onChange={() => toggleSel(e.id)} />,
              fmtDate(e.date),
              <PropBadge name={e.property} />,
              e.vendor || '—',
              <TypeBadge type={e.type} />,
              <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{e.description || '—'}</span>,
              fmt(e.excl_vat),
              fmt(e.vat_15),
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{fmt(e.incl_vat)}</span>,
              e.invoice_receipt ? <a href={e.invoice_receipt} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>View</a> : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>,
            ])}
            editMode={editMode}
          />
        </div>
      )}

      {/* Modals */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
      {action?.type === 'edit' && <EditModal item={action.item} explanation={action.explanation} onClose={() => setAction(null)} onSaved={() => { setAction(null); load() }} />}
      {deleteConfirm.open && (
        <Overlay onClick={() => setDeleteConfirm({ open: false, item: null, text: '' })}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: 14, padding: 28, minWidth: 380, border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Confirm Deletion</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Type <b>delete</b> to confirm</p>
              </div>
            </div>
            <input value={deleteConfirm.text} onChange={e => setDeleteConfirm(d => ({ ...d, text: e.target.value }))} placeholder='Type "delete"' autoFocus style={{ width: '100%', padding: '10px 12px', fontSize: 14, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, outline: 'none', fontFamily: FONT, boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteConfirm({ open: false, item: null, text: '' })} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleteConfirm.text !== 'delete'} style={{ ...btnStyle, background: deleteConfirm.text === 'delete' ? '#ef4444' : 'rgba(239,68,68,0.2)', color: deleteConfirm.text === 'delete' ? '#fff' : 'rgba(255,255,255,0.2)', cursor: deleteConfirm.text === 'delete' ? 'pointer' : 'not-allowed' }}>Delete</button>
            </div>
          </div>
        </Overlay>
      )}
      {editExplain.open && (
        <Overlay onClick={() => setEditExplain({ open: false, item: null, explanation: '' })}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: 14, padding: 28, minWidth: 420, border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Late Edit Warning</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>This entry is over 48 hours old. Please explain why you need to edit.</p>
              </div>
            </div>
            <textarea value={editExplain.explanation} onChange={e => setEditExplain(ex => ({ ...ex, explanation: e.target.value }))} placeholder="Reason for late edit..." rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, outline: 'none', fontFamily: FONT, boxSizing: 'border-box', marginBottom: 16, resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditExplain({ open: false, item: null, explanation: '' })} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={confirmEditExplain} disabled={!editExplain.explanation.trim()} style={{ ...btnStyle, background: editExplain.explanation.trim() ? '#f59e0b' : 'rgba(245,158,11,0.2)', color: editExplain.explanation.trim() ? '#fff' : 'rgba(255,255,255,0.2)', cursor: editExplain.explanation.trim() ? 'pointer' : 'not-allowed' }}>Continue to Edit</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}

/* ── Shared Components ── */

const btnStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s' }

function Card({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: '20px 22px', border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      </div>
    </div>
  )
}

function ChartCard({ title, data }) {
  const labels = Object.keys(data)
  const values = Object.values(data)
  const total = values.reduce((s, v) => s + v, 0)

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: PALETTE.slice(0, labels.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { family: FONT, size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 10 } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 12, bodyFont: { family: FONT }, titleFont: { family: FONT, weight: 600 },
        callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / total) * 100).toFixed(1)}%)` }
      },
    },
    cutout: '65%',
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>{title}</h3>
      <div style={{ height: 240 }}>
        {labels.length > 0 ? <Doughnut data={chartData} options={opts} /> : <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>No data</div>}
      </div>
    </div>
  )
}

function DataTable({ columns, rows, editMode }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((c, i) => <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {row.map((cell, ci) => <td key={ci} style={{ padding: '10px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{cell}</td>)}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 30, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>No entries</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function Check({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, background: checked ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
      {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
    </div>
  )
}

function PropBadge({ name }) {
  const colors = { Malindi: '#3b82f6', Villeroy: '#8b5cf6', Oakdale: '#22c55e', Indaba: '#f59e0b', Enthuse: '#ec4899', 'Sandpiper Mansions': '#14b8a6', 'Mont Bleu': '#f97316' }
  const c = colors[name] || '#6b7280'
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: `${c}18`, color: c, fontSize: 11, fontWeight: 600 }}>{name || '—'}</span>
}

function TypeBadge({ type }) {
  const c = type?.includes('Valuation') ? '#8b5cf6' : type?.includes('Search') ? '#3b82f6' : type?.includes('Report') ? '#f59e0b' : type?.includes('Transport') ? '#14b8a6' : type?.includes('Maintenance') ? '#f97316' : '#6b7280'
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: `${c}18`, color: c, fontSize: 11, fontWeight: 500 }}>{type || '—'}</span>
}

function Overlay({ children, onClick }) {
  return <div onClick={onClick} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>{children}</div>
}

/* ── Add Modal ── */
function AddModal({ onClose, onSaved }) {
  const [kind, setKind] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [vendor, setVendor] = useState('')
  const [property, setProperty] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [receipt, setReceipt] = useState('')
  const [descI, setDescI] = useState('')

  const amt = parseFloat(amount) || 0
  const exclVat = amt / 1.15
  const vat = amt - exclVat

  const save = async () => {
    if (kind === 'income') {
      await post('/petty-cash/income', { date, description: descI || 'Deposit', total: amt })
    } else {
      await post('/petty-cash/expenses', { date, property, vendor, type, description, excl_vat: exclVat, vat_15: vat, incl_vat: amt, invoice_receipt: receipt || null })
    }
    onSaved()
  }

  return (
    <Overlay onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: 16, padding: 28, minWidth: 440, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Add Entry</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>New income or expense</p>
          </div>
        </div>

        {/* Kind Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ k: 'income', l: 'Income', c: '#22c55e' }, { k: 'expense', l: 'Expense', c: '#ef4444' }].map(o => (
            <button key={o.k} onClick={() => setKind(o.k)} style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 600, fontFamily: FONT, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: kind === o.k ? `${o.c}20` : 'rgba(255,255,255,0.03)', color: kind === o.k ? o.c : 'rgba(255,255,255,0.3)' }}>{o.l}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Date" value={date} onChange={setDate} type="date" />
          <Field label={`Amount (R)`} value={amount} onChange={setAmount} type="number" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} />

          {kind === 'expense' && amt > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Excl. VAT</div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{fmt(exclVat)}</div></div>
              <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>VAT 15%</div><div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{fmt(vat)}</div></div>
            </div>
          )}

          {kind === 'income' && <Field label="Description" value={descI} onChange={setDescI} placeholder="Deposit" />}
          {kind === 'expense' && <Field label="Property" value={property} onChange={setProperty} placeholder="e.g. Malindi" />}
          {kind === 'expense' && <Field label="Vendor" value={vendor} onChange={setVendor} placeholder="e.g. Windeed" />}
          {kind === 'expense' && <Field label="Type" value={type} onChange={setType} placeholder="e.g. Valuation" />}
          {kind === 'expense' && <Field label="Description" value={description} onChange={setDescription} />}
          <Field label="Proof of Payment (Link)" value={receipt} onChange={setReceipt} placeholder="https://drive.google.com/..." icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
          <button onClick={save} style={{ ...btnStyle, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save
          </button>
        </div>
      </div>
    </Overlay>
  )
}

/* ── Edit Modal ── */
function EditModal({ item, explanation, onClose, onSaved }) {
  const isIncome = item.total !== undefined
  const [form, setForm] = useState(isIncome ? { date: item.date, description: item.description, total: item.total } : { date: item.date, property: item.property || '', vendor: item.vendor || '', type: item.type || '', description: item.description || '', excl_vat: item.excl_vat || 0, vat_15: item.vat_15 || 0, incl_vat: item.incl_vat || 0, invoice_receipt: item.invoice_receipt || '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (isIncome) await put(`/petty-cash/income/${item.id}`, { ...form, total: parseFloat(form.total) || 0 })
    else await put(`/petty-cash/expenses/${item.id}`, { ...form, excl_vat: parseFloat(form.excl_vat) || 0, vat_15: parseFloat(form.vat_15) || 0, incl_vat: parseFloat(form.incl_vat) || 0 })
    onSaved()
  }

  return (
    <Overlay onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: 16, padding: 28, minWidth: 440, border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Edit {isIncome ? 'Income' : 'Expense'}</h3>
            {explanation && <p style={{ margin: 0, fontSize: 11, color: '#f59e0b' }}>Late edit: {explanation}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Date" value={form.date} onChange={v => set('date', v)} type="date" />
          {isIncome ? (
            <>
              <Field label="Description" value={form.description} onChange={v => set('description', v)} />
              <Field label="Total (R)" value={form.total} onChange={v => set('total', v)} type="number" />
            </>
          ) : (
            <>
              <Field label="Property" value={form.property} onChange={v => set('property', v)} />
              <Field label="Vendor" value={form.vendor} onChange={v => set('vendor', v)} />
              <Field label="Type" value={form.type} onChange={v => set('type', v)} />
              <Field label="Description" value={form.description} onChange={v => set('description', v)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <Field label="Excl. VAT" value={form.excl_vat} onChange={v => set('excl_vat', v)} type="number" />
                <Field label="VAT 15%" value={form.vat_15} onChange={v => set('vat_15', v)} type="number" />
                <Field label="Incl. VAT" value={form.incl_vat} onChange={v => set('incl_vat', v)} type="number" />
              </div>
              <Field label="Proof of Payment (Link)" value={form.invoice_receipt} onChange={v => set('invoice_receipt', v)} placeholder="https://drive.google.com/..." />
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
          <button onClick={save} style={{ ...btnStyle, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save Changes
          </button>
        </div>
      </div>
    </Overlay>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, icon }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>{icon}</div>}
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
          width: '100%', padding: `9px ${icon ? '10px 10px 32px' : '10px'}`, fontSize: 13, color: '#fff',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, outline: 'none', fontFamily: FONT, boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
      </div>
    </div>
  )
}
