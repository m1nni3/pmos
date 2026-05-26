export type VerificationStatus = "verified" | "exception" | "pending";

export interface ReconciliationException {
  id: string;
  source_ledger: string;
  source_transaction_id: string;
  amount: number;
  description: string;
  transaction_date: string;
  status: VerificationStatus;
  notes?: string;
}

export interface MatchResult {
  source: { ledger: string; id: string; amount: number };
  target: { ledger: string; id: string; amount: number };
  confidence: number;
}
