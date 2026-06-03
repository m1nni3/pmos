import React from 'react'
import { ExternalLink } from 'lucide-react'

const portalData = [
  { type: 'Letting Agent', name: 'Kemprent Portal', url: '#' },
  { type: 'Letting Agent', name: 'HuurKor Portal', url: '#' },
  { type: 'Body Corp', name: 'Trafalgar Portal', url: '#' },
  { type: 'Municipal', name: 'Municipal Portal', url: '#' },
  { type: 'Bank', name: 'Nedbank Business', url: '#' },
].filter(portal => 
  !['unknown', 'river hamlet', 'trust'].some(unwanted => 
    portal.name.toLowerCase().includes(unwanted) || 
    portal.type.toLowerCase().includes(unwanted)
  )
)

export default function Portals() {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-pomp-navy mb-6">Portals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portalData.map(p => (
          <div key={p.name} className="card flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{p.type}</p>
              <p className="font-medium text-pomp-navy">{p.name}</p>
            </div>
            <a href={p.url} className="btn-secondary flex items-center gap-1.5">
              <ExternalLink size={14} /> Open
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
