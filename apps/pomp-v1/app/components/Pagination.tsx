import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, totalPages, onChange }: PaginationProps) {
  if (total === 0) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
      <span>{start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-2">Page {page} of {totalPages || 1}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
