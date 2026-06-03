import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = '/api'

async function api(path: string, opts?: RequestInit) {
  const code = typeof window !== 'undefined' ? sessionStorage.getItem('pomp_auth')?.trim() : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (code) headers['Authorization'] = `Bearer ${code}`
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...opts?.headers } })
  return res.json()
}

export const apiClient = {
  get: (path: string) => api(path),
  post: (path: string, data?: any) => api(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path: string, data?: any) => api(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: (path: string) => api(path, { method: 'DELETE' }),
}

export function formatRand(amount: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function exportCSV(filename: string, rows: Record<string, any>[], columns?: { key: string, label: string }[]) {
  if (!rows.length) return
  const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }))
  const escape = (v: any) => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [
    cols.map(c => escape(c.label)).join(','),
    ...rows.map(r => cols.map(c => escape(r[c.key])).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
