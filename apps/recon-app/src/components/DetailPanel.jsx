export default function DetailPanel({ title, accentTag, children }) {
  return (
    <div className="detail-panel">
      <div className="panel-header">
        <h3>{title}</h3>
        {accentTag && <span className="accent-tag">{accentTag}</span>}
      </div>
      <div className="panel-content">
        {children || (
          <div className="empty-state">
            <div className="text">Select a record to view details</div>
          </div>
        )}
      </div>
    </div>
  )
}
