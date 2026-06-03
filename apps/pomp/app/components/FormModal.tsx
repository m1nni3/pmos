import React from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  submitLabel?: string
  isLoading?: boolean
  onSubmit?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function FormModal({
  open,
  onClose,
  title,
  children,
  submitLabel = 'Save',
  isLoading = false,
  onSubmit,
  size = 'md'
}: FormModalProps) {
  if (!open) return null
  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white rounded-card shadow-xl w-full ${maxW} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-heading font-semibold text-pomp-navy">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {children}
        </div>
        {onSubmit && (
          <div className="flex items-center justify-end gap-2 px-4 pb-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button variant="primary" onClick={onSubmit} isLoading={isLoading}>{submitLabel}</Button>
          </div>
        )}
      </div>
    </div>
  )
}
