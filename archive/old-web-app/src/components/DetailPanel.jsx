export default function DetailPanel({ title, accentTag, children }) {
  return (
    <div className="rec-detail-panel">
      <div className="panel-header">
        <h3>{title}</h3>
        {accentTag && <span className="accent-tag status">{accentTag}</span>}
      </div>
      <div className="panel-content">
        {children || (
          <div className="rec-empty-state">Select a record to view details</div>
        )}
      </div>
    </div>
  )
}
