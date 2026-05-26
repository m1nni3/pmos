export interface LedgerEntry {
  id: string;
  property_id: string;
  transaction_date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export interface RentalLedger extends LedgerEntry {
  unit_id: string;
  tenant_name: string;
  rent_period: string;
}

export interface LevyLedger extends LedgerEntry {
  body_corporate: string;
  levy_type: string;
}

export interface MunicipalityLedger extends LedgerEntry {
  account_number: string;
  municipality_name: string;
}

export interface BankLedger extends LedgerEntry {
  account_id: string;
  bank_name: string;
  transaction_type: "deposit" | "withdrawal" | "transfer";
}
