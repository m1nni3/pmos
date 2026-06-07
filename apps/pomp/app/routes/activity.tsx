import { useState } from 'react'
import { Clock, RotateCw, Trash2, User, LogIn, Plus, Pencil, Trash, Download, Upload, Eye } from 'lucide-react'
import { useActivityLog } from '../lib/useActivityLog'
import { apiClient } from '../lib/utils'
import { toast } from 'sonner'
import { ConfirmModal } from '../components'

const ACTION_ICONS: Record<string, any> = {
  create: Plus, update: Pencil, delete: Trash,
  login: LogIn, export: Download, import: Upload, view: Eye,
}

const ACTION_COLORS: Record<string, string> = {
  create: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  delete: 'text-red-600 bg-red-50',
  login: 'text-purple-600 bg-purple-50',
  export: 'text-amber-600 bg-amber-50',
  import: 'text-cyan-600 bg-cyan-50',
  view: 'text-gray-600 bg-gray-50',
}

export default function ActivityPage() {
  const { activities, total, loading, reload } = useActivityLog()
  const [confirmClear, setConfirmClear] = useState(false)

  const clearLog = async () => {
    try {
      await apiClient.del('/activity')
      toast.success('Activity log cleared')
      setConfirmClear(false)
      reload()
    } catch { toast.error('Failed to clear log') }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="page-title">Activity Log</h2>
          <p className="page-sub">{total} events recorded</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reload} className="btn-secondary text-xs flex items-center gap-1"><RotateCw size={13} /> Refresh</button>
          <button onClick={() => setConfirmClear(true)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={13} /> Clear All</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-lg" style={{ height: 52 }} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No activity yet. Actions will appear here as you use the app.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map(a => {
              const Icon = ACTION_ICONS[a.action] || Clock
              const color = ACTION_COLORS[a.action] || 'text-gray-500 bg-gray-50'
              return (
                <div key={a.id} className="card flex items-start gap-3 py-2.5 px-4">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-pomp-navy">
                      <span className="font-medium capitalize">{a.action}</span>
                      {' '}{a.entity_type.replace(/_/g, ' ')}
                      {a.entity_label && <span className="text-gray-500"> — {a.entity_label}</span>}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(a.created_at).toLocaleString('en-ZA')}
                      {a.actor && <span className="ml-2">by {a.actor.slice(0, 12)}</span>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <ConfirmModal
          open={confirmClear}
          onClose={() => setConfirmClear(false)}
          onConfirm={clearLog}
          title="Clear Activity Log"
          message="Are you sure you want to delete all activity records? This cannot be undone."
          confirmLabel="Clear All"
          variant="danger"
        />
      </div>
    </div>
  )
}
