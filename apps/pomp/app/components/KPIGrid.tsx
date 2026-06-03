import React from 'react'
import { cn } from '../lib/utils'

interface KPIItem {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  sub?: string
}

interface KPIGridProps {
  items: KPIItem[]
  cols?: 2 | 3 | 4
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
}

export function KPIGrid({ items, cols = 3 }: KPIGridProps) {
  const colClasses = { 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' }
  return (
    <div className={`grid ${colClasses[cols]} gap-4 mb-6`}>
      {items.map(item => {
        const Icon = item.icon
        return (
          <div key={item.label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[item.color]}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider truncate">{item.label}</p>
              <p className="font-bold text-lg text-pomp-navy truncate">{item.value}</p>
              {item.sub && <p className="text-xs text-gray-400 truncate">{item.sub}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
