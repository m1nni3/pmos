import React from 'react'
import { cn } from '../lib/utils'

export interface DefinitionRow {
  label: string
  value: React.ReactNode
  /** When false, row is hidden even if value is provided (default true) */
  show?: boolean
}

interface DefinitionListProps {
  rows: (DefinitionRow | null | undefined | false)[]
  emptyMessage?: string
  className?: string
}

/**
 * Compact label/value list used to render property, finance, contact, and other
 * read-only field collections. Filters out rows with null/undefined/false values.
 */
export function DefinitionList({ rows, emptyMessage = 'No data on file.', className }: DefinitionListProps) {
  const filtered = rows
    .filter((r): r is DefinitionRow => {
      if (!r) return false
      const v = r.value
      if (v === null || v === undefined || v === '') return false
      if (r.show === false) return false
      return true
    })

  if (filtered.length === 0) {
    return <p className={cn('text-sm text-gray-400 italic', className)}>{emptyMessage}</p>
  }

  return (
    <dl className={cn('divide-y divide-gray-100', className)}>
      {filtered.map(r => (
        <div key={r.label} className="dl-row">
          <dt className="dl-label">{r.label}</dt>
          <dd className="dl-value">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
