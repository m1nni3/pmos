import { useState, useEffect, useRef } from 'react'
import { apiClient } from './utils'

export function useNotificationCount() {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await apiClient.get<{ total?: number }>('/activity?limit=1&offset=0')
        setCount(data?.total || 0)
      } catch { /* ignore */ }
    }
    fetchCount()
    intervalRef.current = setInterval(fetchCount, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return count
}
