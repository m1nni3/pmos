import { useState, useEffect, useCallback } from 'react'
import { apiClient } from './utils'

export interface Activity {
  id: string
  actor: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_label: string
  details: string
  created_at: string
}

interface ActivityResponse {
  results: Activity[]
  total: number
}

export function useActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true)
    try {
      const data: ActivityResponse = await apiClient.get<ActivityResponse>(`/activity?limit=${limit}&offset=${offset}`) ?? { results: [], total: 0 }
      setActivities(data.results)
      setTotal(data.total)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { activities, total, loading, reload: () => load() }
}
