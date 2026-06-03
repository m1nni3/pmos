import React from 'react'

interface SectionProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function Section({ title, subtitle, children, className = '' }: SectionProps) {
  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-pomp-navy text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
