import React from 'react'
import { cn } from '../lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('bg-gray-200 rounded animate-pulse', className)} style={style} />
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-3/4', className)} />
}

export function SkeletonHeading({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-6 w-1/2', className)} />
}

export function SkeletonKPI() {
  return (
    <div className="bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-5 border-t-4 border-t-gray-200">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="grid grid-cols-2 gap-1.5">
          <Skeleton className="h-12 rounded" />
          <Skeleton className="h-12 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-3 bg-gray-50 rounded-t">
        {[40, 25, 15, 20].map((w, i) => <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-gray-100">
          {[40, 25, 15, 20].map((w, j) => <Skeleton key={j} className="h-3" style={{ width: `${w}%` }} />)}
        </div>
      ))}
    </div>
  )
}
