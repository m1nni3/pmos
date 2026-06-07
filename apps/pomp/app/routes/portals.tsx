import React, { useState, useEffect } from 'react'
import { ExternalLink, Copy, Eye, EyeOff, Edit3, Save, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_KEY = 'pomp-portals'

const EMPTY_PORTAL: Portal = { type: '', name: '', url: '', username: '', password: '' }

interface Portal {
  type: string
  name: string
  url: string
  username: string
  password: string
}

const DEFAULT_PORTALS: Portal[] = [
  { type: 'Letting Agent', name: 'Kemprent Portal',    url: 'https://kemprent.co.za',    username: 'enthuse@kemprent.co.za', password: 'Enthuse2026!' },
  { type: 'Letting Agent', name: 'HuurKor Portal',     url: 'https://huurkor.co.za',     username: 'enthuse@huurkor.co.za', password: 'Trust2026!' },
  { type: 'Body Corp',     name: 'Trafalgar Portal',   url: 'https://trafalgar.co.za',   username: 'enthuse@trafalgar.co.za', password: 'OakdaleBC!' },
  { type: 'Municipal',     name: 'Municipal Portal',   url: 'https://www.eservices.gov.za', username: 'enthuse@municipal.co.za', password: 'Mun2026!' },
  { type: 'Bank',          name: 'Nedbank Business',   url: 'https://www.nedbank.co.za', username: 'enthuse@nedbank.co.za', password: 'BankPass2026!' },
]

function loadPortals(): Portal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_PORTALS
}

function savePortals(portals: Portal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portals))
}

export default function Portals() {
  const [portals, setPortals] = useState<Portal[]>(loadPortals)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Portal | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    savePortals(portals)
  }, [portals])

  const copyToClipboard = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  const startEdit = (p: Portal) => {
    setEditingName(p.name)
    setEditForm({ ...p })
  }

  const cancelEdit = () => {
    setEditingName(null)
    setEditForm(null)
  }

  const saveEdit = () => {
    if (!editForm) return
    setPortals(prev => prev.map(p => p.name === editingName ? editForm : p))
    toast.success('Portal updated (saved locally)')
    setEditingName(null)
    setEditForm(null)
  }

  const startAdd = () => {
    setShowAddForm(true)
    setEditingName(null)
    setEditForm(null)
  }

  const saveAdd = (portal: Portal) => {
    if (!portal.name.trim()) { toast.error('Portal name is required'); return }
    setPortals(prev => [...prev, portal])
    toast.success('Portal added (saved locally)')
    setShowAddForm(false)
  }

  const cancelAdd = () => {
    setShowAddForm(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-start justify-between shrink-0 mb-4">
        <div>
          <h2 className="page-title">Portals</h2>
          <p className="page-sub">External e-platforms with auto-login</p>
        </div>
        <button onClick={startAdd}
          className="btn-primary flex items-center gap-1 text-xs">
          <Plus size={14} /> Add Portal
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showAddForm && (
            <AddCard key="__new__" onSave={saveAdd} onCancel={cancelAdd} />
          )}
          {portals.map(p => {
            const isEditing = editingName === p.name
            return isEditing && editForm ? (
              <EditCard key={p.name} form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={cancelEdit} />
            ) : (
              <ViewCard key={p.name} portal={p} visible={visible} copied={copied}
                onToggleVis={() => setVisible(v => ({ ...v, [p.name]: !v[p.name] }))}
                onCopy={copyToClipboard} onEdit={() => startEdit(p)} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AddCard({ onSave, onCancel }: {
  onSave: (p: Portal) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Portal>({ type: '', name: '', url: '', username: '', password: '' })
  const set = (key: keyof Portal, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const field = (label: string, key: keyof Portal) => (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
      <input type="text" value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full border border-pomp-blue rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-pomp-blue outline-none" />
    </div>
  )

  return (
    <div className="card border-2 border-green-400/30">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">New Portal</p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onSave({ ...form })} className="btn-primary flex items-center gap-1 text-xs px-2.5 py-1.5">
            <Save size={12} /> Add
          </button>
          <button onClick={onCancel} className="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('Type', 'type')}
        {field('Name', 'name')}
        {field('URL', 'url')}
        {field('Username', 'username')}
        {field('Password', 'password')}
      </div>
    </div>
  )
}

function ViewCard({ portal, visible, copied, onToggleVis, onCopy, onEdit }: {
  portal: Portal
  visible: Record<string, boolean>
  copied: string | null
  onToggleVis: () => void
  onCopy: (label: string, text: string) => void
  onEdit: () => void
}) {
  const vis = visible[portal.name] || false
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{portal.type}</p>
          <p className="font-semibold text-pomp-navy truncate">{portal.name}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button onClick={onEdit} className="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
            <Edit3 size={12} /> Edit
          </button>
          <a href={portal.url} target="_blank" rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-1.5 text-xs">
            <ExternalLink size={14} /> Open
          </a>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
          <span className="text-gray-500 text-xs">Username</span>
          <div className="flex items-center gap-2 min-w-0 max-w-[70%]">
            <span className="text-gray-800 text-xs font-mono truncate">{portal.username}</span>
            <button onClick={() => onCopy(`user-${portal.name}`, portal.username)}
              className="text-gray-400 hover:text-pomp-blue transition-colors shrink-0" title="Copy username">
              <Copy size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
          <span className="text-gray-500 text-xs">Password</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-800 text-xs font-mono">
              {vis ? portal.password : '••••••••'}
            </span>
            <button onClick={onToggleVis}
              className="text-gray-400 hover:text-pomp-blue transition-colors" title={vis ? 'Hide' : 'Show'}>
              {vis ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button onClick={() => onCopy(`pass-${portal.name}`, portal.password)}
              className="text-gray-400 hover:text-pomp-blue transition-colors" title="Copy password">
              <Copy size={13} />
            </button>
          </div>
        </div>
      </div>
      {copied?.startsWith('user-') && copied?.endsWith(portal.name) && (
        <p className="text-xs text-green-600 mt-2">Username copied!</p>
      )}
      {copied?.startsWith('pass-') && copied?.endsWith(portal.name) && (
        <p className="text-xs text-green-600 mt-2">Password copied!</p>
      )}
    </div>
  )
}

function EditCard({ form, onChange, onSave, onCancel }: {
  form: Portal
  onChange: (f: Portal) => void
  onSave: () => void
  onCancel: () => void
}) {
  const set = (key: keyof Portal, val: string) => onChange({ ...form, [key]: val })

  const field = (label: string, key: keyof Portal) => (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
      <input type="text" value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-pomp-blue outline-none" />
    </div>
  )

  return (
    <div className="card border-2 border-pomp-blue/20">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-pomp-blue uppercase tracking-wider">Editing</p>
        <div className="flex items-center gap-1.5">
          <button onClick={onSave} className="btn-primary flex items-center gap-1 text-xs px-2.5 py-1.5">
            <Save size={12} /> Save
          </button>
          <button onClick={onCancel} className="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('Type', 'type')}
        {field('Name', 'name')}
        {field('URL', 'url')}
        {field('Username', 'username')}
        {field('Password', 'password')}
      </div>
    </div>
  )
}
