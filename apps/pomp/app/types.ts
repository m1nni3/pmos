// Shared domain types for the POMP app

export type ContactCategory = 'emergency' | 'service_provider' | 'professional'

export interface Contact {
  id: string
  property_id: string
  category: ContactCategory
  subcategory: string | null
  name: string
  role: string | null
  company: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export interface Document {
  id: string
  property_id: string
  name: string
  category?: string | null
  expiry_date?: string | null
  file_url?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  notes?: string | null
}

export type PLCategoryKey =
  | 'rentalIncome'
  | 'levy'
  | 'bondPayments'
  | 'commission'
  | 'maintenance'
  | 'municipal'
  | 'misc'

export interface PLCategory {
  key: PLCategoryKey
  label: string
  sign: 1 | -1
}

export interface PLBudget {
  id: string
  property_id: string | null
  category: string
  year: number
  budget_amount: number | null
  actual_override?: number | null
}

export interface PLMonthly {
  id: string
  property_id: string | null
  category_key: string
  year: number
  month: number
  amount: number
}

export interface PLEntry {
  id: string
  property_id: string | null
  category_key: string
  year: number
  month: number
  amount: number
  description: string | null
  deducted_expenses: string | null
}

export interface DebriefSection {
  heading: string
  content: string
}

export interface DebriefContent {
  date: string
  overview: string
  docLink: string
  sections: DebriefSection[]
}

export interface DebriefItem {
  id: string
  title: string
  content: string
  created_at: string
}

export type ExposureStatus = 'critical' | 'warning' | 'active' | 'info' | 'ok' | 'warn'

export interface Exposure {
  id: number
  label: string
  amount: number | null
  status: ExposureStatus
  category: string
}

export type TaskStatus = 'overdue' | 'active' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  text: string
  due: string
  priority: TaskPriority
  status: TaskStatus
  done: boolean
}

export interface PettyCashIncome {
  id: string
  date: string
  description: string
  amount: number
  category: string | null
  property_id: string | null
  notes: string | null
}

export interface PettyCashExpense {
  id: string
  date: string
  description: string
  amount: number
  category: string | null
  supplier: string | null
  vat_inclusive: boolean
  property_id: string | null
  notes: string | null
}

export interface PettyCashData {
  income: PettyCashIncome[]
  expenses: PettyCashExpense[]
  totalIncome: number
  totalExpenses: number
  balance: number
}

export type PettyCashEntry =
  | (PettyCashIncome & { type: 'income' })
  | (PettyCashExpense & { type: 'expense' })

export interface TaskItem {
  id: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  due_date: string | null
  status: 'pending' | 'in_progress' | 'done'
  property_id: string | null
  created_at: string
}

export interface Property {
  id: string
  name: string
  address: string | null
  scheme_name: string | null
  unit_count?: number | null
  suburb?: string | null
  current_market_value?: number | null
  purchase_price?: number | null
}

export interface Bond {
  id: string
  property_id: string
  bank: string | null
  account_number: string | null
  original_amount: number | null
  monthly_payment: number | null
  expected_payoff_date: string | null
  payment_method: string | null
}

export interface PropertyDetail extends Property {
  [key: string]: unknown
  // property_details columns from SQL join
  size_sqm?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking?: number | null
  owner_name?: string | null
  managing_agent_name?: string | null
  municipality_name?: string | null
  tenant_name?: string | null
  bc_name?: string | null
  gallery_images?: string[]
  bonds?: Bond[]
  valuation_date?: string | null
  bond_endorsement?: string | null
  bond_endorsement_date?: string | null
  bond_status?: string | null
  lease_expiry?: string | null
  managing_agency?: string | null
}

export type PropertyFieldFormat = 'currency' | 'date'

export interface PropertyField {
  key: string
  label: string
  type?: 'text' | 'number'
  format?: PropertyFieldFormat
}

export type PropertyDetailTab =
  | 'Overview'
  | 'Finance'
  | 'Letting Agent'
  | 'Managing Agent'
  | 'Body Corp'
  | 'Municipal'
  | 'Insurance'
  | 'Tenants'
  | 'Documents'

export type DetailTab = Exclude<PropertyDetailTab, 'Documents'>

export type TabContactFilter = (subcategory: string) => boolean

export const TAB_CONTACT_FILTERS: Partial<Record<PropertyDetailTab, TabContactFilter>> = {
  'Letting Agent':   (s) => s.startsWith('Letting Agent'),
  'Managing Agent':  (s) => s === 'Managing Agent',
  'Body Corp':       (s) => s === 'Body Corporate',
  'Insurance':       (s) => s === 'Insurance' || s === 'Insurance Broker',
  'Municipal':       (s) => s === 'Municipality',
  'Tenants':         (s) => s === 'Tenant',
}
