import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function PortfolioDocuments() {
  const [properties, setProperties] = useState<any[]>([])
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.properties.list().then(async props => {
      setProperties(props)
      const docList: any[] = []
      for (const p of props) {
        try {
          const docs = await api.propertyResource.list(p.id, 'property-documents')
          docList.push(...docs.map((d: any) => ({ ...d, property_name: p.name })))
        } catch {}
      }
      setAllDocs(docList)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading…</p>

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <h1 style={{ margin: '0 0 0.25rem' }}>Documents</h1>
      <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>All documents across the portfolio</p>

      <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
        {allDocs.length === 0
          ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No documents uploaded yet.</p>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr>{['Property', 'Name', 'Type', 'Category', 'Uploaded', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{allDocs.map(d => <tr key={d.id}>{[d.property_name, d.document_name, d.document_type, d.category, d.uploaded_date || d.created_at ? new Date(d.uploaded_date || d.created_at).toLocaleDateString() : '—', d.notes].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}</tr>)}</tbody>
            </table>
        }
      </div>
    </div>
  )
}
