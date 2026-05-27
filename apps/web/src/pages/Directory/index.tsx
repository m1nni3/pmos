import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { Contact, ContactRole } from '../../types/contact'

const TABS: { key: ContactRole; label: string }[] = [
  { key: 'managing_agent', label: 'Managing Agents' },
  { key: 'letting_agent',  label: 'Letting Agents' },
  { key: 'municipality',   label: 'Municipalities' },
  { key: 'bank',           label: 'Banks' },
  { key: 'contractor',     label: 'Contractors' },
]

const EMPTY: Omit<Contact, 'id'> = { role: 'managing_agent', name: '', email: '', phone: '', address: '', account_number: '', notes: '' }

export default function Directory() {
  const [role, setRole] = useState<ContactRole>('managing_agent')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<Contact> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.contacts.list(role).then(data => { setContacts(data as Contact[]); setLoading(false) })
  }, [role])

  async function save() {
    if (!form?.name?.trim()) return
    setSaving(true)
    if (form.id) {
      const data = await api.contacts.update(form.id, form)
      setContacts(prev => prev.map(c => c.id === form.id ? data as Contact : c))
    } else {
      const data = await api.contacts.create({ ...EMPTY, ...form, role })
      setContacts(prev => [...prev, data as Contact])
    }
    setSaving(false)
    setForm(null)
  }

  async function remove(id: string) {
    if (!confirm('Delete this contact?')) return
    await api.contacts.remove(id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div style={s.toolbar}>
        <h1 style={s.h1}>Directory</h1>
        <button style={s.btn} onClick={() => setForm({ ...EMPTY, role })}>+ Add</button>
      </div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t.key} style={{ ...s.tab, ...(role === t.key ? s.tabActive : {}) }}
            onClick={() => { setRole(t.key); setForm(null) }}>
            {t.label}
          </button>
        ))}
      </div>

      {form && (
        <div style={s.formBox}>
          <div style={s.formGrid}>
            {(['name','email','phone','address','account_number','notes'] as const).map(f => (
              <label key={f} style={s.label}>
                <span style={s.labelText}>{f.replace('_', ' ')}</span>
                <input
                  style={s.input}
                  value={(form as any)[f] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <div style={s.formActions}>
            <button style={s.btn} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button style={s.btnGhost} onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading
        ? <p style={s.muted}>Loading…</p>
        : contacts.length === 0
          ? <p style={s.muted}>No {TABS.find(t => t.key === role)?.label.toLowerCase()} found.</p>
          : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>{['Name','Email','Phone','Address','Account No.','Notes',''].map(h =>
                    <th key={h} style={s.th}>{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id}>
                      <td style={{ ...s.td, fontWeight: 500 }}>{c.name}</td>
                      <td style={s.td}>{c.email ?? '—'}</td>
                      <td style={s.td}>{c.phone ?? '—'}</td>
                      <td style={s.td}>{c.address ?? '—'}</td>
                      <td style={s.td}>{c.account_number ?? '—'}</td>
                      <td style={{ ...s.td, color: '#6b7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.notes ?? '—'}</td>
                      <td style={s.td}>
                        <span style={s.action} onClick={() => setForm(c)}>Edit</span>
                        {' · '}
                        <span style={{ ...s.action, color: '#ef4444' }} onClick={() => remove(c.id)}>Del</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  toolbar:    { display: 'flex', alignItems: 'center', marginBottom: '1rem' },
  h1:         { fontSize: '1.25rem', fontWeight: 600, marginRight: 'auto' },
  btn:        { padding: '0.35rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  btnGhost:   { padding: '0.35rem 0.9rem', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  tabs:       { display: 'flex', gap: 2, marginBottom: '1.25rem', flexWrap: 'wrap' },
  tab:        { padding: '0.35rem 0.85rem', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: '0.82rem' },
  tabActive:  { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' },
  formBox:    { background: '#fff', borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  formGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
  label:      { display: 'flex', flexDirection: 'column', gap: 3 },
  labelText:  { fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' },
  input:      { padding: '0.35rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: '0.85rem' },
  formActions:{ display: 'flex', gap: '0.5rem' },
  tableWrap:  { overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th:         { textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' },
  td:         { padding: '0.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' },
  action:     { cursor: 'pointer', color: '#6366f1', fontSize: '0.78rem' },
  muted:      { color: '#9ca3af', fontSize: '0.85rem' },
}
