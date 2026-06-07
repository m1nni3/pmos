CREATE TABLE IF NOT EXISTS pl_entries (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  category_key TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT DEFAULT '',
  deducted_expenses TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pl_entries_period ON pl_entries(property_id, year, month);
