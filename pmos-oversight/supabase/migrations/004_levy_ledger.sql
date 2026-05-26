CREATE TABLE levy_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference TEXT,
  body_corporate TEXT NOT NULL,
  levy_type TEXT NOT NULL
);

CREATE INDEX idx_levy_ledger_property ON levy_ledger(property_id);
