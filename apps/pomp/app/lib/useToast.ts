import { useCallback, useState } from 'react'
import { ToastType, ToastProps } from '../components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const add = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastProps = { id, message, type, duration }
    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message: string) => add(message, 'success'), [add])
  const error = useCallback((message: string) => add(message, 'error'), [add])
  const info = useCallback((message: string) => add(message, 'info'), [add])
  const warning = useCallback((message: string) => add(message, 'warning'), [add])

  return { toasts, add, remove, success, error, info, warning }
}
