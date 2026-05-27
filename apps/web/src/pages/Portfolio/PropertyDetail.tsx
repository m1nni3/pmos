import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../api'
import TabsOverview from './tabs/Overview'
import TabsDetails from './tabs/Details'
import TabsFinance from './tabs/Finance'
import TabsInsurance from './tabs/Insurance'
import TabsContacts from './tabs/Contacts'
import TabsDocuments from './tabs/Documents'
import TabsHistory from './tabs/History'
import TabsActivity from './tabs/Activity'

const TABS = ['Overview', 'Details', 'Finance', 'Insurance', 'Contacts', 'Documents', 'History', 'Activity']

export default function PropertyDetail() {
  const { propertyId } = useParams()
  const [property, setProperty] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    if (propertyId) api.properties.get(propertyId).then(setProperty).catch(console.error)
  }, [propertyId])

  if (!property) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading property…</p>

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':    return <TabsOverview property={property} />
      case 'Details':     return <TabsDetails property={property} />
      case 'Finance':     return <TabsFinance property={property} />
      case 'Insurance':   return <TabsInsurance property={property} />
      case 'Contacts':    return <TabsContacts property={property} />
      case 'Documents':   return <TabsDocuments property={property} />
      case 'History':     return <TabsHistory property={property} />
      case 'Activity':    return <TabsActivity property={property} />
      default:            return <TabsOverview property={property} />
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem' }}>
        <Link to="/portfolio/properties" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>Properties</Link>
        <span style={{ color: '#9ca3af' }}>/</span>
        <span style={{ fontSize: '0.85rem', color: '#374151' }}>{property.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: 8, background: `url(https://placehold.co/160x160/e2e8f0/64748b?text=${encodeURIComponent(property.name?.charAt(0) || 'P')}) center/cover` }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{property.name}</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
            {property.address}, {property.city} — {property.type || 'Property'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: activeTab === t ? 600 : 400,
              color: activeTab === t ? '#6366f1' : '#6b7280',
              borderBottom: activeTab === t ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: -2,
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 300 }}>
        {renderTab()}
      </div>
    </div>
  )
}
