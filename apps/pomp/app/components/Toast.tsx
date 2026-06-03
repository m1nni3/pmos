import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose?: () => void
}

export function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose?.(), duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  const icons = {
    success: <CheckCircle size={18} className="text-green-600" />,
    error: <AlertCircle size={18} className="text-red-600" />,
    info: <Info size={18} className="text-blue-600" />,
    warning: <AlertCircle size={18} className="text-amber-600" />,
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[type]} animate-in fade-in slide-in-from-top-4 duration-300`}>
      {icons[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={() => onClose?.()} className="opacity-60 hover:opacity-100 p-0.5">
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastProps[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm pointer-events-auto">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  )
}
