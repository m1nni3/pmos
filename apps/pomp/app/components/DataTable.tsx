import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: (v: any, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  defaultSort?: { key: string, dir: 'asc' | 'desc' }
  compact?: boolean
}

export function DataTable<T extends Record<string, any>>({
  columns, data, rowKey, onRowClick, emptyMessage = 'No data', defaultSort, compact = false
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(defaultSort?.key || null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(defaultSort?.dir || 'desc')

  const sorted = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [data, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const py = compact ? 'py-1.5' : 'py-2.5'
  const px = 'px-3'

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-y border-pomp-border text-left">
            {columns.map(col => (
              <th
                key={String(col.key)}
                style={col.width ? { width: col.width } : undefined}
                className={`${px} ${compact ? 'py-2' : 'py-2.5'} text-xs font-semibold text-gray-500 uppercase tracking-wider
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                  ${col.sortable ? 'cursor-pointer select-none hover:text-pomp-navy' : ''}
                  ${col.className || ''}`}
                onClick={() => col.sortable && toggleSort(String(col.key))}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === String(col.key) && (
                    sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-10 text-center text-gray-400 italic text-sm">{emptyMessage}</td></tr>
          ) : sorted.map((row, i) => (
            <tr
              key={rowKey(row)}
              className={`border-b border-pomp-border/40 transition-colors
                ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                ${onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-gray-50'}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={`${px} ${py}
                    ${col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : ''}
                    ${col.className || ''}`}
                >
                  {col.format ? col.format(row[col.key as keyof T], row) : (row[col.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
