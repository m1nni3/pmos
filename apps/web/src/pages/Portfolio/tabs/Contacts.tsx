import { useEffect, useState } from 'react'
import { api } from '../../../api'

interface Props { property: any }

export default function Contacts({ property }: Props) {
  const [contacts, setContacts] = useState<any[]>([])
  useEffect(() => { api.propertyResource.list(property.id, 'property-contacts').then(setContacts).catch(console.error) }, [property.id])

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Property Contacts</h3>
      {contacts.length === 0
        ? <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No contacts linked to this property.</p>
        : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr>{['Name', 'Role', 'Company', 'Email', 'Phone'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{contacts.map(c => <tr key={c.id}>{[c.name, c.role, c.company, c.email, c.phone].map((v, i) => <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{v || '—'}</td>)}</tr>)}</tbody>
          </table>
      }
    </div>
  )
}
