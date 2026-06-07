import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, CheckCircle2, Circle, Clock, X } from 'lucide-react'
import { apiClient, formatDate } from '../lib/utils'
import { toast } from 'sonner'
import { ConfirmModal } from '../components'
import type { TaskItem } from '../types'

type TaskPriority = 'low' | 'medium' | 'high'
type TaskFilterStatus = 'all' | 'pending' | 'in_progress' | 'done'
type TaskCycle = 'pending' | 'in_progress' | 'done'

interface TaskForm {
  title: string
  description: string
  priority: TaskPriority
  due_date: string
}

const PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'] as const
const STATUSES: readonly Exclude<TaskFilterStatus, 'all'>[] = ['pending', 'in_progress', 'done'] as const

const priorityColor: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
}

const EMPTY_FORM: TaskForm = { title: '', description: '', priority: 'medium', due_date: '' }

export default function TasksPage() {
  const [items, setItems] = useState<TaskItem[]>([])
  const [filter, setFilter] = useState<TaskFilterStatus>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const load = () => {
    apiClient.get<TaskItem[]>(`/tasks?status=${filter}`).then(d => setItems(d ?? []))
    setSelected(new Set())
  }
  useEffect(() => { load() }, [filter])

  const save = async () => {
    if (!form.title.trim()) return
    try {
      if (editingId) {
        await apiClient.put(`/tasks/${editingId}`, form)
        toast.success('Task updated')
      } else {
        await apiClient.post('/tasks', form)
        toast.success('Task created')
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      load()
    } catch {
      toast.error('Failed to save task')
    }
  }

  const edit = (item: TaskItem) => {
    setEditingId(item.id)
    setForm({ title: item.title, description: item.description || '', priority: item.priority, due_date: item.due_date || '' })
  }

  const remove = async (id: string) => {
    try {
      await apiClient.del(`/tasks/${id}`)
      toast.success('Task deleted')
      setConfirmDelete(null)
      load()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const bulkDelete = async () => {
    try {
      await Promise.all(Array.from(selected).map(id => apiClient.del(`/tasks/${id}`)))
      toast.success(`${selected.size} tasks deleted`)
      setConfirmBulkDelete(false)
      load()
    } catch {
      toast.error('Failed to delete some tasks')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleStatus = async (item: TaskItem) => {
    const next: TaskCycle = item.status === 'done' ? 'pending' : item.status === 'in_progress' ? 'done' : 'in_progress'
    try {
      await apiClient.put(`/tasks/${item.id}`, { status: next })
      load()
    } catch {
      toast.error('Failed to update task')
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Tasks</h2>
          <p className="text-xs text-gray-400">Track what needs to get done</p>
        </div>
      </div>

      <div className={`card my-3 ${editingId ? 'border-2 border-pomp-blue/30' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          <Plus size={18} className="text-pomp-blue" />
          <h4 className="font-semibold text-sm text-pomp-navy">{editingId ? 'Edit Task' : 'New Task'}</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <label className="sr-only" htmlFor="task-title">Task title</label>
          <input id="task-title" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-pomp-blue md:col-span-2" />
          <label className="sr-only" htmlFor="task-priority">Priority</label>
          <select id="task-priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
            className="border border-gray-300 rounded px-2 py-2 text-sm outline-none focus:border-pomp-blue">
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <label className="sr-only" htmlFor="task-desc">Description</label>
          <input id="task-desc" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-pomp-blue md:col-span-2" />
          <label className="sr-only" htmlFor="task-due">Due date</label>
          <input id="task-due" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
            className="border border-gray-300 rounded px-2 py-2 text-sm outline-none focus:border-pomp-blue" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary text-sm">{editingId ? 'Update' : 'Add Task'}</button>
          {editingId && <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }} className="btn-secondary text-sm">Cancel</button>}
        </div>
      </div>

      <div className="flex gap-2 mb-3" role="tablist" aria-label="Task status filter">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} role="tab" aria-selected={filter === s}
            className={`text-xs px-3 py-1.5 rounded-lg capitalize ${filter === s ? 'bg-pomp-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'in_progress' ? 'In Progress' : s}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-pomp-navy text-white text-xs rounded-lg">
            <span className="font-semibold">{selected.size} selected</span>
            <div className="flex-1" />
            <button onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-1 hover:text-red-300"><Trash2 size={13} /> Delete</button>
            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 hover:text-gray-300"><X size={13} /> Clear</button>
          </div>
        )}

        {items.map(item => {
          const checked = selected.has(item.id)
          return (
            <div key={item.id} className={`card flex items-start justify-between py-2.5 ${item.status === 'done' ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <input type="checkbox" checked={checked} onChange={() => toggleSelect(item.id)}
                  className="mt-1.5 shrink-0 accent-pomp-navy" />
                <button onClick={() => toggleStatus(item)} className="mt-0.5 shrink-0">
                  {item.status === 'done'
                    ? <CheckCircle2 size={18} className="text-green-500" />
                    : item.status === 'in_progress'
                      ? <Clock size={18} className="text-amber-500" />
                      : <Circle size={18} className="text-gray-300 hover:text-pomp-blue" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-medium text-sm ${item.status === 'done' ? 'line-through text-gray-400' : 'text-pomp-navy'}`}>{item.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor[item.priority]}`}>{item.priority}</span>
                    {item.status === 'in_progress' && <span className="badge-blue text-[10px]">In Progress</span>}
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formatDate(item.created_at)}
                    {item.due_date && ` · Due: ${item.due_date}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button onClick={() => edit(item)} className="text-gray-300 hover:text-pomp-blue p-1"><Pencil size={14} /></button>
                <button onClick={() => setConfirmDelete(item.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">No tasks yet.</p>}
      </div>

      <ConfirmModal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => remove(confirmDelete!)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmModal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={bulkDelete}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selected.size} tasks? This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
      />
    </div>
  )
}
