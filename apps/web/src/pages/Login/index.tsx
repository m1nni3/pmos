import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signInWithGoogle } = useAuth()

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>PMOS</div>
        <h1 style={s.h1}>Property Management<br />Oversight System</h1>
        <p style={s.sub}>Sign in to access your portfolio</p>
        <button style={s.btn} onClick={signInWithGoogle}>
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 8, flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.4C9.7 35.5 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.1 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  card: { background: '#fff', borderRadius: 12, padding: '3rem 2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.1)', textAlign: 'center', width: 360 },
  logo: { fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', letterSpacing: 2, marginBottom: '1rem' },
  h1:   { fontSize: '1.1rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4, marginBottom: '0.5rem' },
  sub:  { fontSize: '0.85rem', color: '#6b7280', marginBottom: '2rem' },
  btn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
}
