export interface LedgerEntry {
  id: string
  property_id: string
  date: string
  description: string
  debit: number
  credit: number
  balance: number
  reference?: string
  source: 'rental' | 'levy' | 'municipality' | 'bank'
}
