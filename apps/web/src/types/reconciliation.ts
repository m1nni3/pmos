export type ReconciliationStatus = 'matched' | 'unmatched' | 'exception' | 'pending'

export interface ReconciliationRecord {
  id: string
  property_id: string
  period: string
  rental_amount: number
  bank_amount: number
  variance: number
  status: ReconciliationStatus
  notes?: string
  created_at: string
}
