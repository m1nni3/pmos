import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, signOut } = useAuth()

  return (
    <header style={s.bar}>
      <span style={s.title}>Property Management Oversight System</span>
      <div style={s.right}>
        {user && <span style={s.email}>{user.email}</span>}
        <button style={s.btn} onClick={signOut}>Sign out</button>
      </div>
    </header>
  )
}

const s: Record<string, React.CSSProperties> = {
  bar:   { height: 56, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem' },
  title: { fontWeight: 600, fontSize: '0.9rem', flex: 1 },
  right: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  email: { fontSize: '0.8rem', color: '#6b7280' },
  btn:   { padding: '0.3rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' },
}
