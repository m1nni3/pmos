import React from 'react'
import { Search } from 'lucide-react'
import type { Property } from '../types'

export interface FilterBarProps {
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}

export function FilterBar({ search, onSearchChange, searchPlaceholder = 'Search…', children }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search || ''}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue"
          />
        </div>
      )}
      {children}
    </div>
  )
}

export function PropertyFilter({ value, onChange, properties }: { value: string, onChange: (v: string) => void, properties: Property[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-pomp-blue">
      <option value="all">All Properties</option>
      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )
}
