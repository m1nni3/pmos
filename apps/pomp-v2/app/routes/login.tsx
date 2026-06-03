import React, { useState } from 'react'

export default function Login() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/auth?code=${encodeURIComponent(code)}`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        // Store trimmed token to avoid whitespace issues
        sessionStorage.setItem('pomp_auth', (data.token || code).trim())
        // Use timeout to ensure sessionStorage is set before redirecting
        setTimeout(() => {
          window.location.replace('/overview')
        }, 0)
      } else {
        setError('Invalid access code')
        setLoading(false)
      }
    } catch {
      setError('Connection error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pomp-navy to-gray-900">
      <div className="bg-white rounded-card shadow-xl p-8 w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-pomp-navy">P.O.M.P</h1>
        <p className="text-gray-500 text-sm mb-6">Property Oversight Management Portal</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Access Code</label>
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-pomp-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pomp-blue/30 focus:border-pomp-blue"
              placeholder="Enter access code"
              autoFocus
            />
          </div>
          {error && <p className="text-pomp-red text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
