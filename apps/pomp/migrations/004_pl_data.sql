-- P/L Data table for budget and actual override storage
-- Separate per-property, per-year, per-category

CREATE TABLE IF NOT EXISTS pl_data (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  year TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_amount REAL DEFAULT 0,
  actual_override REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pl_data_prop_year_cat ON pl_data(property_id, year, category);
