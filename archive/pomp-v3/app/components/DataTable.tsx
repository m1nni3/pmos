import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: (v: any, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  defaultSort?: { key: string, dir: 'asc' | 'desc' }
}

export function DataTable<T extends Record<string, any>>({ columns, data, rowKey, onRowClick, emptyMessage = 'No data', defaultSort }: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(defaultSort?.key || null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(defaultSort?.dir || 'desc')

  const sorted = React.useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const as = String(av), bs = String(bv)
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
    })
  }, [data, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-pomp-border">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`pb-2 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.sortable ? 'cursor-pointer select-none hover:text-pomp-navy' : ''} ${col.className || ''}`}
                onClick={() => col.sortable && toggleSort(String(col.key))}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === String(col.key) && (
                    sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-6 text-center text-gray-400 italic">{emptyMessage}</td></tr>
          ) : sorted.map(row => (
            <tr
              key={rowKey(row)}
              className={`border-b border-pomp-border/50 hover:bg-pomp-light/50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={`py-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
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
