CREATE TYPE verification_status AS ENUM ('verified', 'exception', 'pending');

CREATE TABLE reconciliation_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ledger TEXT NOT NULL,
  source_transaction_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ledger TEXT NOT NULL,
  source_transaction_id UUID NOT NULL,
  target_ledger TEXT NOT NULL,
  target_transaction_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  confidence NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reconciliation_status ON reconciliation_exceptions(status);
