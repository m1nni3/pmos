import React from 'react'
import { cn } from '../lib/utils'

interface KPIItem {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

interface KPIGridProps {
  items: KPIItem[]
  cols?: 2 | 3 | 4
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-t-blue-500'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-t-green-500'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-t-orange-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-t-purple-500' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-t-red-500'    },
}

export function KPIGrid({ items, cols = 3 }: KPIGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }
  return (
    <div className={`grid ${colClasses[cols]} gap-4 mb-6`}>
      {items.map(item => {
        const Icon = item.icon
        const c = colorMap[item.color]
        return (
          <div key={item.label} className={`bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-5 border-t-4 ${c.border} flex items-start gap-4`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
              <p className={`font-bold text-xl mt-0.5 ${c.text} leading-tight`}>{item.value}</p>
              {item.sub && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.sub}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
