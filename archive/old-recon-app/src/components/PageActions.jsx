export default function PageActions({ title, children }) {
  return (
    <div className="page-actions">
      <span className="page-title">{title}</span>
      <div className="spacer" />
      {children}
    </div>
  )
}
