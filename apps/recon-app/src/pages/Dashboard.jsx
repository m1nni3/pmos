import { useState, useEffect } from 'react'
import * as api from '../api.js'
import PageActions from '../components/PageActions.jsx'
import SummaryMetrics from '../components/SummaryMetrics.jsx'
import DataTable from '../components/DataTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'

const COLUMNS = [
  { key: 'name', label: 'Property' },
  { key: 'address', label: 'Address' },
  { key: 'scheme_name', label: 'Scheme' },
  { key: 'unit_count', label: 'Units' },
]

export default function Dashboard() {
  const [props, setProps] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/properties'),
      api.get('/dashboard'),
    ]).then(([propsData, dashData]) => {
      setProps(propsData)
      setDashboard(dashData)
      if (propsData.length) setSelected(propsData[0])
    }).finally(() => setLoading(false))
  }, [])

  const metrics = dashboard ? [
    { label: 'Portfolio Value', value: `R${(dashboard.totalPortfolioValue / 1000).toFixed(0)}K`, trend: `Yield ${dashboard.netYield}%` },
    { label: 'Properties', value: String(dashboard.propertiesOwned), trend: `${dashboard.totalUnits} total units` },
    { label: 'Bond Exposure', value: `R${(dashboard.totalBondExposure / 1000).toFixed(0)}K`, trend: `R${(dashboard.monthlyBondPayments / 1000).toFixed(0)}K/mo` },
    { label: 'Insurance Alerts', value: String(dashboard.expiringPolicies), trend: 'Policies expiring' },
  ] : []

  const selProp = props.find(p => p.id === selected) || null

  return (
    <div className="section">
      <PageActions title="Dashboard" />
      <SummaryMetrics metrics={metrics} />
      <div className="workspace">
        <DataTable
          columns={COLUMNS}
          rows={props}
          selectedId={selected}
          onSelect={setSelected}
        />
        <DetailPanel title={selProp ? selProp.name : 'Dashboard'}>
          {selProp && (
            <>
              <div className="detail-section">
                <h4>Property Summary</h4>
                <div className="detail-row"><span className="lbl">Address</span><span className="val">{selProp.address || '—'}</span></div>
                <div className="detail-row"><span className="lbl">Scheme</span><span className="val">{selProp.scheme_name || '—'}</span></div>
                <div className="detail-row"><span className="lbl">Units</span><span className="val">{selProp.unit_count}</span></div>
                <div className="detail-row"><span className="lbl">Market Value</span><span className="val">{selProp.current_market_value ? `R${Number(selProp.current_market_value).toLocaleString()}` : '—'}</span></div>
                <div className="detail-row"><span className="lbl">Purchase Price</span><span className="val">{selProp.purchase_price ? `R${Number(selProp.purchase_price).toLocaleString()}` : '—'}</span></div>
              </div>
              {selProp.created_at && (
                <div className="detail-section">
                  <h4>History</h4>
                  <div className="activity-item"><strong>Added</strong> — {new Date(selProp.created_at).toLocaleDateString()}</div>
                </div>
              )}
            </>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
