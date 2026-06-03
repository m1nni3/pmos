import React, { useState, useEffect } from 'react'
import { apiClient, formatRand } from '../lib/utils'
import { FilterBar, PropertyFilter } from '../components/FilterBar'
import { DataTable, Column } from '../components/DataTable'
import { Button } from '../components/Button'
import { useCache } from '../lib/cache'
import { toast } from 'sonner'

// Import PapaParse for CSV parsing
import Papa from 'papaparse'

export default function Import() {
  const { properties } = useCache()
  
  const [csvData, setCsvData] = useState<any[]>([])
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([])
   const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
   const [ledgerType, setLedgerType] = useState<'rental_ledger' | 'levy_ledger' | 'municipality_ledger'>('rental_ledger')
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState<{ added: number; skippedExact: number; skippedSmart: number } | null>(null)
  const [omittedRecords, setOmittedRecords] = useState<any[]>([])

  // Normalise a raw amount string/number to a float
  const parseAmount = (v: any): number => {
    if (v === null || v === undefined || v === '') return 0
    const s = String(v).trim()
    // Parentheses = negative: (448.50) → -448.50
    const neg = s.startsWith('(') && s.endsWith(')')
    const clean = s.replace(/[()R\s]/g, '').replace(/,/g, '')
    const n = parseFloat(clean) || 0
    return neg ? -n : n
  }

  // Normalise dates: handles dd/mm/yyyy, dd/mm/yy, "Jan-25", ISO, "31 Dec 2020"
  const parseDate = (v: any): string => {
    if (!v) return new Date().toISOString().split('T')[0]
    const s = String(v).trim()
    // Jan-25 → 2025-01-01
    const monYear = s.match(/^([A-Za-z]{3})-(\d{2})$/)
    if (monYear) {
      const months: Record<string,string> = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' }
      const m = months[monYear[1].toLowerCase()] || '01'
      const y = parseInt(monYear[2]) < 50 ? `20${monYear[2]}` : `19${monYear[2]}`
      return `${y}-${m}-01`
    }
    // dd/mm/yyyy or dd/mm/yy
    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
    if (dmy) {
      const y = dmy[3].length === 2 ? (parseInt(dmy[3]) < 50 ? `20${dmy[3]}` : `19${dmy[3]}`) : dmy[3]
      return `${y}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`
    }
    // "31 Dec 2020"
    const longDate = new Date(s)
    if (!isNaN(longDate.getTime())) return longDate.toISOString().split('T')[0]
    return s
  }

  // Auto-detect column mappings
  useEffect(() => {
    if (parsedHeaders.length === 0) return
    const mapping: Record<string, string> = {}
    const h = (s: string) => s.toLowerCase().trim()

    const find = (candidates: string[]) => parsedHeaders.find(col => candidates.includes(h(col)))

    mapping.date        = find(['date', 'transaction_date', 'transaction date', 'posting date', 'value date']) || ''
    mapping.description = find(['description', 'transaction_details', 'details', 'narration', 'memo']) || ''
    mapping.balance     = find(['balance', 'running balance', 'closing balance']) || ''
    mapping.category    = find(['category', 'transaction_type', 'type', 'classification']) || ''
    mapping.reference   = find(['reference', 'ref', 'cheque_no', 'cheque no', 'transaction_id', 'entry_type', 'entry type']) || ''
    mapping.property_id = find(['property_id', 'property', 'property_name']) || ''

    // Single-amount column detection (signed or direction-flagged)
    const singleAmt = find(['amount', 'amount (zar)', 'amount_incl_vat'])
    const isCredit  = find(['is_credit'])
    if (singleAmt) {
      mapping.amount   = singleAmt
      if (isCredit) mapping.isCredit = isCredit
    } else {
      mapping.debit  = find(['debit', 'withdrawal', 'payment', 'outgoing', 'amount (dr)']) || ''
      mapping.credit = find(['credit', 'deposit', 'incoming', 'amount (cr)']) || ''
    }

    setColumnMapping(mapping)
  }, [parsedHeaders])

  const [isDragging, setIsDragging] = useState(false)

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          toast.error('CSV parsing error: ' + result.errors[0].message)
          return
        }
        setCsvData(result.data)
        setParsedHeaders(result.meta.fields || [])
        setPreviewData([])
        setImportStats(null)
        setOmittedRecords([])
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      toast.error('Please drop a CSV file')
      return
    }
    parseFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    parseFile(file)
  }

  const generatePreview = async () => {
    if (csvData.length === 0) return

    const mapped = csvData.map(row => {
      const date = parseDate(row[columnMapping.date])
      const description = String(row[columnMapping.description] ?? '').trim()
      const balance = parseAmount(row[columnMapping.balance])
      const category = String(row[columnMapping.category] ?? 'Uncategorized').trim() || 'Uncategorized'

      let debit = 0, credit = 0

      if (columnMapping.amount) {
        // Single signed amount column
        const amt = parseAmount(row[columnMapping.amount])
        if (columnMapping.isCredit) {
          // Tshwane: Is_Credit flag determines direction
          const isCr = String(row[columnMapping.isCredit]).toLowerCase()
          if (isCr === 'yes' || isCr === 'true' || isCr === '1') credit = Math.abs(amt)
          else debit = Math.abs(amt)
        } else {
          // Oakdale / Villeroy: negative = debit, positive = credit
          if (amt < 0) debit = Math.abs(amt)
          else credit = amt
        }
      } else {
        debit  = parseAmount(row[columnMapping.debit])
        credit = parseAmount(row[columnMapping.credit])
      }

      const reference = columnMapping.reference ? String(row[columnMapping.reference] ?? '').trim() : ''

      // property_id: CSV column takes precedence; fall back to UI selector
      let resolvedPropertyId: string | null = null
      if (columnMapping.property_id && row[columnMapping.property_id]) {
        // Try to match by name from the loaded properties list
        const csvPropVal = String(row[columnMapping.property_id]).trim()
        const matched = properties.find((p: any) =>
          p.name?.toLowerCase() === csvPropVal.toLowerCase() ||
          p.id === csvPropVal
        )
        resolvedPropertyId = matched ? matched.id : csvPropVal
      } else {
        resolvedPropertyId = selectedProperty === 'all' ? null : selectedProperty
      }

      return {
        date,
        description,
        debit,
        credit,
        balance,
        reference,
        category,
        property_id: resolvedPropertyId,
        ledger_type: ledgerType,
      }
    })

    setPreviewData(mapped)
  }

  const handleImport = async () => {
    if (previewData.length === 0) return
    
    setIsImporting(true)
    
    try {
      // Prepare data for import - strip out UI-only fields
      const importData = previewData.map(row => ({
        property_id: row.property_id,
        date: row.date,
        description: row.description,
        debit: row.debit,
        credit: row.credit,
        balance: row.balance,
        reference: row.reference || null,
        category: row.category
      }))
      
      // Call import API
      const response = await apiClient.post('/api/import/execute', {
        ledger_type: ledgerType,
        entries: importData
      })
      
      setImportStats({
        added: response.inserted,
        skippedExact: response.skippedExact || 0,
        skippedSmart: response.skippedSmart || 0
      })
      
      setOmittedRecords(response.omitted || [])
      
      toast.success(`Import complete: ${response.inserted} records added`)
    } catch (error: any) {
      toast.error(`Import failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const columns: Column<any>[] = [
    { key: 'date', label: 'Date', sortable: true, format: (v: string) => <span className="whitespace-nowrap">{v}</span> },
    { key: 'description', label: 'Description' },
    { key: 'reference', label: 'Ref', format: (v: string) => v ? <span className="text-xs text-gray-500">{v}</span> : '—' },
    { key: 'debit', label: 'Debit', align: 'right', format: (v: number) => v ? <span className="text-red-600 whitespace-nowrap">{formatRand(v)}</span> : '—' },
    { key: 'credit', label: 'Credit', align: 'right', format: (v: number) => v ? <span className="text-green-600 whitespace-nowrap">{formatRand(v)}</span> : '—' },
    { key: 'balance', label: 'Balance', align: 'right', format: (v: number) => <span className="whitespace-nowrap">{formatRand(v)}</span> },
    { key: 'category', label: 'Category', sortable: true, format: (v: string) => <span className="badge-blue">{v || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Import Statements</h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload CSV statements from letting agents (Kemprent, Trafalgar, HuurKor) or banks
          </p>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging ? 'border-pomp-blue bg-pomp-blue/5' : 'border-pomp-border/50 hover:border-pomp-border'}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-3">
                {/* Note: In a real app, we'd use an actual Upload icon here */}
                <div className="text-pomp-blue text-3xl">📄</div>
                <p className="font-medium">Drag & drop CSV file here, or click to select</p>
                <p className="text-xs text-gray-500">
                  Supports Kemprent, Trafalgar, HuurKor, and bank statements
                </p>
              </div>
            </label>
          </div>
          
           {csvData.length > 0 && (
             <div className="space-y-3">
               <p className="text-sm text-gray-600">
                 {csvData.length} rows detected • {parsedHeaders.length} columns
               </p>
               <div className="flex flex-wrap gap-2">
                {parsedHeaders.map((header, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-50 text-xs rounded">
                    {header}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Column Mapping Section */}
      {parsedHeaders.length > 0 && (
        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pomp-navy">Column Mapping</h3>
              <p className="text-xs text-gray-500">
                Map your CSV columns to the required fields below
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Date Column *</label>
                <select value={columnMapping.date || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- select --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description Column *</label>
                <select value={columnMapping.description || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- select --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Column <span className="text-gray-400 font-normal">(signed, single col)</span></label>
                <select value={columnMapping.amount || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, amount: e.target.value, debit: '', credit: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- use Debit/Credit instead --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Is_Credit Flag <span className="text-gray-400 font-normal">(optional, Tshwane)</span></label>
                <select value={columnMapping.isCredit || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, isCredit: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- none --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Debit Column</label>
                <select value={columnMapping.debit || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, debit: e.target.value, amount: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- select --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Column</label>
                <select value={columnMapping.credit || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, credit: e.target.value, amount: '' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- select --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Balance Column</label>
                <select value={columnMapping.balance || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, balance: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- select --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference Column</label>
                <select value={columnMapping.reference || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, reference: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- none --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Column <span className="text-gray-400 font-normal">(overrides selector)</span></label>
                <select value={columnMapping.property_id || ''} onChange={(e) => setColumnMapping(prev => ({ ...prev, property_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- use selector below --</option>
                  {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ledger Type and Property Selectors */}
      {parsedHeaders.length > 0 && (
        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pomp-navy">Import Settings</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Ledger Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Ledger Type</label>
                <select
                  value={ledgerType}
                  onChange={(e) => setLedgerType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="rental_ledger">Rental Ledger</option>
                  <option value="levy_ledger">Levy Ledger</option>
                  <option value="municipality_ledger">Municipality Ledger</option>
                </select>
              </div>
              
              {/* Property Selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Properties (Import without property assignment)</option>
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview Section */}
      {previewData.length > 0 && (
        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pomp-navy">Preview ({previewData.length} rows)</h3>
              <Button 
                variant="outline" 
                onClick={generatePreview}
                disabled={isImporting}
              >
                Refresh Preview
              </Button>
            </div>
            
            <DataTable 
              columns={columns} 
              data={previewData} 
              rowKey={(r: any) => r.date + r.description + r.debit + r.credit}
              defaultSort={{ key: 'date', dir: 'desc' }}
              className="import-preview-table"
            />
          </div>
        </div>
      )}
      
      {/* Import Button and Results */}
      {(csvData.length > 0 || previewData.length > 0) && (
        <div className="card">
          <div className="space-y-4">
            {!isImporting && importStats === null && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleImport}
                  isLoading={isImporting}
                  disabled={previewData.length === 0 || isImporting}
                >
                  {isImporting ? 'Importing…' : 'Import Data'}
                </Button>
              </div>
            )}
            
            {isImporting && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 border-2 border-pomp-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Importing data…</span>
                </div>
              </div>
            )}
            
            {importStats && (
              <div className="space-y-4">
                <div className="grid gap-4 text-center">
                  <div className="border-l-4 border-pomp-blue pl-4">
                    <p className="text-2xl font-bold text-pomp-navy">{importStats.added}</p>
                    <p className="text-xs text-gray-500">Records Added</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <p className="text-2xl font-bold text-green-600">{importStats.skippedExact}</p>
                    <p className="text-xs text-gray-500">Exact Duplicates Skipped</p>
                  </div>
                  <div className="border-l-4 border-amber-400 pl-4">
                    <p className="text-2xl font-bold text-amber-600">{importStats.skippedSmart}</p>
                    <p className="text-xs text-gray-500">Smart Duplicates (Review)</p>
                  </div>
                </div>
                
                {omittedRecords.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-pomp-navy mb-2">Omitted Records ({omittedRecords.length})</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      These records were skipped due to duplication. Export to review or <a href="#" className="text-pomp-blue underline">view matched records</a>.
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // Export omitted records as CSV
                        const csvHeaders = ['date', 'description', 'debit', 'credit', 'balance', 'category', 'reason']
                        const csvRows = omittedRecords.map((record: any) => ({
                          date: record.date,
                          description: record.description,
                          debit: record.debit,
                          credit: record.credit,
                          balance: record.balance,
                          category: record.category,
                          reason: record.reason || 'duplicate'
                        }))
                        // Use existing exportCSV utility
                        // In a real implementation, we'd call the export function here
                        toast.info('Export functionality would be implemented here')
                      }}
                    >
                      Export Omitted as CSV
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}