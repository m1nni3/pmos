import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  meta?: string
}

export function PageHeader({ title, subtitle, action, meta }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-sub">{subtitle}</p>}
        {meta && <p className="text-xs text-pomp-blue mt-0.5 font-medium">{meta}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}
