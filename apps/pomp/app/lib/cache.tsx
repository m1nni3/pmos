import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from './utils'

const cache = new Map<string, { data: any; fetchedAt: number }>()
const inflight = new Map<string, Promise<any>>()
const STALE_MS = 60_000
const RETRY_MS = 3_000

function getCached(key: string) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > STALE_MS) return null
  return entry.data
}

function setCached(key: string, data: any) {
  cache.set(key, { data, fetchedAt: Date.now() })
}

export async function fetchWithCache(key: string, fetcher: () => Promise<any>): Promise<any> {
  const cached = getCached(key)
  if (cached) return cached
  const existing = inflight.get(key)
  if (existing) return existing
  const promise = fetcher().then(data => {
    setCached(key, data)
    inflight.delete(key)
    return data
  }).catch(err => {
    inflight.delete(key)
    const entry = cache.get(key)
    if (entry && Date.now() - entry.fetchedAt < RETRY_MS) return entry.data
    throw err
  })
  inflight.set(key, promise)
  return promise
}

export function invalidateCache(key?: string) {
  key ? cache.delete(key) : cache.clear()
}

interface CacheContextValue {
  dashboard: any
  properties: any[]
  refreshDashboard: () => Promise<void>
  refreshProperties: () => Promise<void>
  get: (key: string, fetcher: () => Promise<any>) => Promise<any>
  invalidate: (key?: string) => void
}

const CacheContext = createContext<CacheContextValue | null>(null)

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await fetchWithCache('/api/dashboard', () => apiClient.get('/dashboard'))
      setDashboard(data)
    } catch (e) { console.error(e) }
  }, [])

  const refreshProperties = useCallback(async () => {
    try {
      const data = await fetchWithCache('/api/properties', () => apiClient.get('/properties'))
      setProperties(data)
    } catch (e) { console.error(e) }
  }, [])

  const get = useCallback(async (key: string, fetcher: () => Promise<any>) => {
    return fetchWithCache(key, fetcher)
  }, [])

  const invalidate = useCallback((key?: string) => {
    invalidateCache(key)
  }, [])

  useEffect(() => {
    refreshDashboard()
    refreshProperties()
  }, [])

  return (
    <CacheContext.Provider value={{ dashboard, properties, refreshDashboard, refreshProperties, get, invalidate }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const ctx = useContext(CacheContext)
  if (!ctx) throw new Error('useCache must be used within CacheProvider')
  return ctx
}
