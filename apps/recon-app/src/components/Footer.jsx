export default function Footer() {
  const now = new Date()
  const ts = now.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', hour12: false })
  return (
    <footer className="app-footer">
      <span>BINOS v1.0</span>
      <span>Production</span>
      <span>Last refresh: {ts}</span>
      <div className="spacer" />
      <a href="#" onClick={e => e.preventDefault()}>Help</a>
      <a href="#" onClick={e => e.preventDefault()}>Support</a>
    </footer>
  )
}
