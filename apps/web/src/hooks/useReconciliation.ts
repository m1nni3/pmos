import { useState, useEffect } from 'react'
export function useReconciliation() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { setLoading(false) }, [])
  return { data, loading }
}
