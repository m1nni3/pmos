import React from 'react'

interface SectionProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  card?: boolean
  action?: React.ReactNode
}

export function Section({ title, subtitle, children, className = '', card = true, action }: SectionProps) {
  return (
    <div className={`${card ? 'bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] overflow-hidden' : ''} mb-6 ${className}`}>
      {title && (
        <div className={`flex items-center justify-between ${card ? 'px-5 pt-4 pb-3 border-b border-pomp-border/60' : 'mb-3'}`}>
          <div>
            <h3 className="font-heading font-semibold text-pomp-navy text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={card ? 'p-5' : ''}>{children}</div>
    </div>
  )
}
