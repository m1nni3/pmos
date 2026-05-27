import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function Documents({ property }: Props) {
  const [docs, setDocs] = useState<any[]>([])
  useEffect(() => { api.propertyResource.list(property.id, 'property-documents').then(setDocs).catch(console.error) }, [property.id])

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Documents</h3>
      {docs.length === 0
        ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No documents uploaded.</p>
        : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr>{['Name', 'Type', 'Category', 'Uploaded', 'Notes'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{docs.map(d => <tr key={d.id}>{[d.document_name, d.document_type, d.category, d.uploaded_date || d.created_at ? new Date(d.uploaded_date || d.created_at).toLocaleDateString() : '—', d.notes].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}</tr>)}</tbody>
          </table>
      }
    </div>
  )
}
