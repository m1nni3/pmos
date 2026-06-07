-- Store monthly actual P/L data imported from spreadsheet
DROP TABLE IF EXISTS pl_monthly;
CREATE TABLE IF NOT EXISTS pl_monthly (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  year TEXT NOT NULL,
  month INTEGER NOT NULL,
  category_key TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  UNIQUE(property_id, year, month, category_key)
);
CREATE INDEX IF NOT EXISTS idx_pl_monthly_prop_year ON pl_monthly(property_id, year);
