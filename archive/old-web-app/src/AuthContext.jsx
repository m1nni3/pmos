import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, authenticated: false, email: null, role: null })

  useEffect(() => {
    fetch('/api/_auth/me')
      .then(r => r.json())
      .then(d => setState({ loading: false, ...d }))
      .catch(() => setState({ loading: false, authenticated: false, email: null, role: null }))
  }, [])

  return (
    <AuthContext.Provider value={{
      ...state,
      isAdmin: state.role === 'admin',
      isReadOnly: state.role === 'readonly',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
