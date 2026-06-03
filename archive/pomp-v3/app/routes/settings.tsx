import React, { useState, useEffect } from 'react'
import { apiClient, formatRand } from '../lib/utils'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import { DataTable, Column } from '../components/DataTable'
import { Button } from '../components/Button'
import { useCache } from '../lib/cache'
import { toast } from 'sonner'

export default function Settings() {
  const { properties } = useCache()
  
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newMapping, setNewMapping] = useState({
    property_id: '',
    ledger_type: 'rental_ledger',
    pattern: '',
    category: '',
    priority: '0',
    is_active: true
  })
  
  const [filterProperty, setFilterProperty] = useState<string>('all')
  const [filterLedgerType, setFilterLedgerType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')
  
  const ledgerTypes = [
    { value: 'rental_ledger', label: 'Rental Ledger' },
    { value: 'levy_ledger', label: 'Levy Ledger' },
    { value: 'municipality_ledger', label: 'Municipality Ledger' },
    { value: 'bank_ledger', label: 'Bank Ledger' }
  ]
  
  useEffect(() => {
    fetchMappings()
  }, [filterProperty, filterLedgerType, filterActive])
  
  const fetchMappings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterProperty && filterProperty !== 'all') params.append('property_id', filterProperty)
      if (filterLedgerType && filterLedgerType !== 'all') params.append('ledger_type', filterLedgerType)
      if (filterActive && filterActive !== 'all') params.append('is_active', filterActive === 'active' ? '1' : '0')
      
      const response = await apiClient.get(`/ledger/mapping?${params.toString()}`)
      setMappings(Array.isArray(response) ? response : (response?.results || []))
    } catch (error) {
      toast.error('Failed to load mappings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddMapping = async () => {
    if (!newMapping.pattern.trim() || !newMapping.category.trim()) {
      toast.error('Pattern and category are required')
      return
    }
    
    try {
      const response = await apiClient.post('/ledger/mapping', {
        property_id: newMapping.property_id || null,
        ledger_type: newMapping.ledger_type,
        pattern: newMapping.pattern.trim(),
        category: newMapping.category.trim(),
        priority: parseInt(newMapping.priority) || 0,
        is_active: newMapping.is_active
      })
      
      setMappings(prev => [...prev, response])
      setNewMapping({
        property_id: '',
        ledger_type: 'rental_ledger',
        pattern: '',
        category: '',
        priority: '0',
        is_active: true
      })
      
      toast.success('Mapping added successfully')
    } catch (error) {
      toast.error('Failed to add mapping')
      console.error(error)
    }
  }
  
  const handleUpdateMapping = async (id: string, updates: any) => {
    try {
      await apiClient.put(`/ledger/mapping/${id}`, updates)
      setEditingId(null)
      await fetchMappings()
      toast.success('Mapping updated successfully')
    } catch (error) {
      toast.error('Failed to update mapping')
      console.error(error)
    }
  }
  
  const handleDeleteMapping = async (id: string) => {
    try {
      await apiClient.del(`/ledger/mapping/${id}`)
      setMappings(prev => prev.filter(m => m.id !== id))
      toast.success('Mapping deleted successfully')
    } catch (error) {
      toast.error('Failed to delete mapping')
      console.error(error)
    }
  }
  
  const handleEditMapping = (mapping: any) => {
    setEditingId(mapping.id)
    setNewMapping({
      property_id: mapping.property_id || '',
      ledger_type: mapping.ledger_type,
      pattern: mapping.pattern,
      category: mapping.category,
      priority: String(mapping.priority),
      is_active: mapping.is_active === 1
    })
  }
  
  const columns: Column<any>[] = [
    { key: 'ledger_type', label: 'Ledger Type', format: (v: string) => {
      const type = ledgerTypes.find(t => t.value === v)
      return type ? <span>{type.label}</span> : <span>{v}</span>
    }},
    { key: 'property_id', label: 'Property', format: (v: any) => {
      if (!v) return <span className="text-gray-500">All Properties</span>
      const prop = properties.find((p: any) => p.id === v)
      return prop ? <span>{prop.name}</span> : <span>{v}</span>
    }},
    { key: 'pattern', label: 'Pattern' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', align: 'center' },
    { key: 'is_active', label: 'Status', format: (v: number) => 
      v === 1 ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>
    },
    { key: 'actions', label: 'Actions', align: 'center', format: () => <span>Actions</span> }
  ]
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Ledger Mapping Settings</h2>
          <p className="text-xs text-gray-500 mt-1">
            Create rules to automatically categorize ledger entries based on description patterns
          </p>
        </div>
        {editingId === null && (
          <Button variant="outline" onClick={() => setNewMapping({
            property_id: '',
            ledger_type: 'rental_ledger',
            pattern: '',
            category: '',
            priority: '0',
            is_active: true
          })}>
            Clear Form
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Property</label>
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Properties</option>
              {properties.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ledger Type</label>
            <select
              value={filterLedgerType}
              onChange={(e) => setFilterLedgerType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Ledger Types</option>
              {ledgerTypes.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Mapping Form */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pomp-navy">
              {editingId ? 'Edit Mapping' : 'Add New Mapping'}
            </h3>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Property Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Property</label>
                <select
                  value={newMapping.property_id}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, property_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Properties (Global)</option>
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Ledger Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Ledger Type *</label>
                <select
                  value={newMapping.ledger_type}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, ledger_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {ledgerTypes.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pattern Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Description Pattern *</label>
                <input
                  type="text"
                  value={newMapping.pattern}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, pattern: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., %ACB CREDIT%, %LEVY PAYMENT%, %RENT%"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use SQL LIKE patterns: % for any characters, _ for single character
                </p>
              </div>
              
              {/* Category Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  type="text"
                  value={newMapping.category}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Bank Fee, Levy Payment, Rental Income"
                />
              </div>
              
              {/* Priority Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input
                  type="number"
                  value={newMapping.priority}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers are checked first (0-100)
                </p>
              </div>
              
              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMapping.is_active}
                  onChange={(e) => setNewMapping(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-pomp-blue focus:ring-pomp-blue border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium">Active</span>
              </div>
            </div>
            
             <div className="flex justify-end">
               <Button
                 onClick={() => editingId ? handleUpdateMapping(editingId, newMapping) : handleAddMapping()}
                 isLoading={loading}
                 disabled={loading}
               >
                 {editingId ? 'Update Mapping' : 'Add Mapping'}
               </Button>
             </div>
           </div>
        </div>
      </div>
      
      {/* Mappings Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-5 w-5 border-2 border-pomp-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-2 text-sm">Loading mappings...</p>
        </div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No mappings found. Add your first mapping above.</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pomp-navy">Ledger Mappings ({mappings.length})</h3>
              <Button variant="outline" onClick={fetchMappings}>
                Refresh
              </Button>
            </div>
            
            <DataTable 
              columns={columns} 
              data={mappings} 
              rowKey={(r: any) => r.id}
              defaultSort={{ key: 'priority', dir: 'desc' }}
              className="mappings-table"
            />
          </div>
        </div>
      )}
    </div>
  )
}