import React from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>
  title?: string
  message?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No data',
  message = 'Nothing to show here yet.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-300" />
      </div>
      <h3 className="font-heading font-semibold text-gray-400 text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4 max-w-xs">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
