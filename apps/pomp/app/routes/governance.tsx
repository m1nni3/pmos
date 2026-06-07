import React from 'react'
import { ShieldCheck } from 'lucide-react'

export default function Governance() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="page-title">Governance</h2>
          <p className="page-sub">Trust governance, meetings, and compliance</p>
        </div>
      </div>
      <div className="bg-white rounded-card shadow-[0_0.4rem_1.2rem_rgba(0,0,0,.06)] p-8 text-center">
        <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">Coming Soon</h3>
        <p className="text-sm text-gray-400">Meeting minutes, resolutions, and compliance tracking will appear here.</p>
      </div>
    </div>
  )
}
