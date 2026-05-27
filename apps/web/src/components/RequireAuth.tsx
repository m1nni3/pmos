import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem', color: '#9ca3af' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
