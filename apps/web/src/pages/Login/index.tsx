import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Step = 'email' | 'sent'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    setLoading(false)
    if (error) { setError(error); return }
    setStep('sent')
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>PMOS</div>
        <h1 style={s.h1}>Property Management<br />Oversight System</h1>

        {step === 'email' ? (
          <>
            <p style={s.sub}>Enter your email to receive a sign-in link</p>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} onClick={submit} disabled={loading}>
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </>
        ) : (
          <>
            <p style={s.sent}>✓ Link sent to <strong>{email}</strong></p>
            <p style={s.sub}>Check your inbox and click the link to sign in.</p>
            <button style={s.btnGhost} onClick={() => setStep('email')}>Use a different email</button>
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  card:     { background: '#fff', borderRadius: 12, padding: '3rem 2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.1)', textAlign: 'center', width: 360 },
  logo:     { fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', letterSpacing: 2, marginBottom: '1rem' },
  h1:       { fontSize: '1.1rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4, marginBottom: '0.5rem' },
  sub:      { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' },
  input:    { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' },
  btn:      { width: '100%', padding: '0.7rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
  btnGhost: { width: '100%', padding: '0.7rem', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', fontSize: '0.85rem' },
  error:    { color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem' },
  sent:     { color: '#22c55e', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' },
}
