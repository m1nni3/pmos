export default function SummaryMetrics({ metrics }) {
  return (
    <div className="summary-row">
      {metrics.map((m, i) => (
        <div className="summary-card" key={i}>
          <div className="label">{m.label}</div>
          <div className="value">{m.value}</div>
        </div>
      ))}
    </div>
  )
}
