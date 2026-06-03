-- Ledger Description Mapping Table
-- Allows users to create rules for automatically categorizing ledger entries
-- based on description patterns

CREATE TABLE IF NOT EXISTS ledger_mapping (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id), -- NULL means applies to all properties
  ledger_type TEXT NOT NULL, -- rental_ledger, levy_ledger, etc.
  pattern TEXT NOT NULL, -- SQL LIKE pattern to match against description
  category TEXT NOT NULL, -- The category to assign when pattern matches
  priority INTEGER DEFAULT 0, -- Higher priority rules are checked first
  is_active INTEGER DEFAULT 1, -- 1 = active, 0 = inactive
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ledger_mapping_property ON ledger_mapping(property_id);
CREATE INDEX IF NOT EXISTS idx_ledger_mapping_ledger_type ON ledger_mapping(ledger_type);
CREATE INDEX IF NOT EXISTS idx_ledger_mapping_active ON ledger_mapping(is_active);
CREATE INDEX IF NOT EXISTS idx_ledger_mapping_priority ON ledger_mapping(priority DESC);

-- Insert some example mappings for common patterns
INSERT OR IGNORE INTO ledger_mapping (id, property_id, ledger_type, pattern, category, priority)
VALUES 
  ('map_acb_credit_001', NULL, 'bank_ledger', '%ACB CREDIT%', 'Bank Fee', 10),
  ('map_acb_debit_001', NULL, 'bank_ledger', '%ACB DEBIT%', 'Bank Charge', 10),
  ('map_levy_payment_001', NULL, 'levy_ledger', '%LEVY%', 'Levy Payment', 10),
  ('map_rental_income_001', NULL, 'rental_ledger', '%RENT%', 'Rental Income', 10),
  ('map_municipal_rates_001', NULL, 'municipality_ledger', '%RATES%', 'Municipal Rates', 10);