export interface Property {
  id: string
  name: string
  address: string
  scheme_name?: string
  unit_count: number
  managing_agent_id?: string
  letting_agent_id?: string
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  tenant_name?: string
  monthly_rental: number
  lease_start?: string
  lease_end?: string
}
