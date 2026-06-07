import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', variant = 'danger', isLoading = false,
}: ConfirmModalProps) {
  if (!open) return null

  const colors = {
    danger: { icon: 'text-red-500', bg: 'bg-red-50', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: 'text-amber-500', bg: 'bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700' },
    default: { icon: 'text-pomp-blue', bg: 'bg-blue-50', btn: 'bg-pomp-blue hover:bg-pomp-navy' },
  }
  const c = colors[variant]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-card shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-heading font-semibold text-pomp-navy">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded"><X size={18} /></button>
        </div>
        <div className="p-4">
          <div className={`flex items-start gap-3 ${c.bg} rounded-lg p-3`}>
            <AlertTriangle size={20} className={`${c.icon} shrink-0 mt-0.5`} />
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 ${c.btn}`}>
            {isLoading && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
