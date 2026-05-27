export type ContactRole = 'managing_agent' | 'letting_agent' | 'municipality' | 'bank' | 'contractor'

export interface Contact {
  id: string
  role: ContactRole
  name: string
  email?: string
  phone?: string
  address?: string
  account_number?: string
  notes?: string
}
