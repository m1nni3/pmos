export default function DataTable({ columns, rows, selectedId, onSelect, onRenderCell }) {
  return (
    <div className="master">
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="table-empty">
                <td colSpan={columns.length}>No records found</td>
              </tr>
            ) : (
              rows.map(row => (
                <tr
                  key={row.id}
                  className={selectedId === row.id ? 'selected' : ''}
                  onClick={() => onSelect(row.id)}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {onRenderCell ? onRenderCell(col.key, row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
