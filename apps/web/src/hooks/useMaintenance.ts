import { useState, useEffect } from 'react'
export function useMaintenance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { setLoading(false) }, [])
  return { data, loading }
}
