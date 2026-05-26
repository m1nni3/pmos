CREATE TABLE rental_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference TEXT,
  tenant_name TEXT,
  rent_period TEXT
);

CREATE INDEX idx_rental_ledger_property ON rental_ledger(property_id);
CREATE INDEX idx_rental_ledger_date ON rental_ledger(transaction_date);
