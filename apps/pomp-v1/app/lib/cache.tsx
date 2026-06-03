import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from './utils'

interface DashboardData {
  totalProperties: number
  totalUnits: number
  totalValue: number
  rentalIncome: number
  rentalExpenses: number
  levyIncome: number
  levyExpenses: number
  bankDeposits: number
  bankWithdrawals: number
  municipalityTotal: number
  reconciliation: Record<string, any>
  properties: any[]
  fetchedAt: number
}

interface CacheContextValue {
  dashboard: DashboardData | null
  refreshDashboard: () => Promise<void>
  properties: any[]
  refreshProperties: () => Promise<void>
}

const CacheContext = createContext<CacheContextValue | null>(null)

const STALE_MS = 60_000

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [properties, setProperties] = useState<any[]>([])

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await apiClient.get('/dashboard') as DashboardData
      setDashboard({ ...data, fetchedAt: Date.now() })
    } catch (e) { console.error(e) }
  }, [])

  const refreshProperties = useCallback(async () => {
    try {
      const data = await apiClient.get('/properties') as any[]
      setProperties(data)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    if (!dashboard || (Date.now() - dashboard.fetchedAt) > STALE_MS) refreshDashboard()
    if (properties.length === 0) refreshProperties()
  }, [])

  return (
    <CacheContext.Provider value={{ dashboard, refreshDashboard, properties, refreshProperties }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const ctx = useContext(CacheContext)
  if (!ctx) throw new Error('useCache must be used within CacheProvider')
  return ctx
}
