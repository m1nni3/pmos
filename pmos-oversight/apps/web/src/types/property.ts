export interface Property {
  id: string;
  name: string;
  address: string;
  type: "residential" | "commercial" | "mixed";
  units: number;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  tenant_name?: string;
  rent_amount: number;
  deposit_amount: number;
  status: "occupied" | "vacant" | "maintenance";
}
