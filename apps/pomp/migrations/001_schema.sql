-- POMP Database Schema
-- Property Oversight Management Portal

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  scheme_name TEXT,
  unit_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS property_details (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL UNIQUE REFERENCES properties(id),
  unit_number TEXT, door_number TEXT, erf_number TEXT,
  scheme_number TEXT, size_sqm REAL,
  bedrooms INTEGER, bathrooms INTEGER, parking_bays INTEGER,
  suburb TEXT, township TEXT, lpi_code TEXT,
  purchase_date TEXT, purchase_price REAL, current_market_value REAL,
  title_deed_reference TEXT,
  owner_name TEXT, owner_id TEXT, registered_owner TEXT,
  municipality_name TEXT, municipal_valuation REAL,
  municipal_valuation_year INTEGER, municipal_account_number TEXT,
  municipal_paid_by TEXT,
  agency TEXT, managing_agent_name TEXT, portfolio_manager TEXT,
  agent_email TEXT, agent_phone TEXT,
  account_administrator TEXT, maintenance_manager TEXT,
  department_head TEXT, management_fee REAL,
  payment_method TEXT, branch TEXT, branch_code TEXT,
  tenant_name TEXT, tenant_phone TEXT, tenant_email TEXT,
  tenant_notes TEXT,
  bc_name TEXT, bc_registration_number TEXT,
  bc_bank TEXT, bc_account_name TEXT, bc_branch TEXT,
  bc_branch_code TEXT, bc_levy_reference TEXT,
  bc_levy_payment_method TEXT, bc_contact_name TEXT,
  bc_contact_phone TEXT, bc_contact_email TEXT,
  bond_bank TEXT, bond_account_number TEXT,
  original_bond_amount REAL, monthly_bond_payment REAL,
  expected_payoff_date TEXT,
  insurer TEXT, broker TEXT, policy_number TEXT,
  policy_holder TEXT, geyser_excess REAL,
  annual_renewal_date TEXT, insurance_contact TEXT,
  emergency_contact_name TEXT, emergency_contact_phone TEXT,
  emergency_contact_email TEXT, emergency_contact_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  tenant_name TEXT, tenant_phone TEXT, tenant_email TEXT,
  monthly_rental REAL, deposit REAL,
  lease_start TEXT, lease_end TEXT,
  status TEXT DEFAULT 'vacant',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rental_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  date TEXT NOT NULL,
  description TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  reference TEXT,
  category TEXT,
  imported_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS levy_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  date TEXT NOT NULL,
  description TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  reference TEXT,
  category TEXT,
  imported_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS municipality_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  date TEXT NOT NULL,
  description TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  reference TEXT,
  category TEXT,
  imported_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bank_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  date TEXT NOT NULL,
  description TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL DEFAULT 0,
  reference TEXT,
  category TEXT,
  imported_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reconciliation (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  period TEXT NOT NULL,
  ledger_type TEXT NOT NULL,
  ledger_amount REAL DEFAULT 0,
  bank_amount REAL DEFAULT 0,
  vendor_amount REAL DEFAULT 0,
  variance REAL GENERATED ALWAYS AS (coalesce(bank_amount,0) - coalesce(ledger_amount,0)),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS work_orders (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  unit_id TEXT REFERENCES units(id),
  contractor_id TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  urgency TEXT DEFAULT 'routine',
  liability TEXT,
  cost_estimate REAL,
  actual_cost REAL,
  receipt_received INTEGER DEFAULT 0,
  raised_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  account_number TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bonds (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  bank TEXT,
  account_number TEXT,
  original_amount REAL,
  monthly_payment REAL,
  expected_payoff_date TEXT,
  payment_method TEXT,
  provider_name TEXT, provider_phone TEXT,
  provider_email TEXT, provider_notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  insurer TEXT, broker TEXT,
  policy_number TEXT, policy_holder TEXT,
  coverage_amount REAL, excess REAL, premium REAL,
  renewal_date TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  notes TEXT,
  expiry_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS property_history (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  event_type TEXT,
  title TEXT,
  description TEXT,
  event_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  action_items TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portals (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  login_credentials TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ledger_conflicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL,
  ledger_type TEXT NOT NULL,
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  value_a TEXT,
  value_b TEXT,
  field_name TEXT,
  ref_date TEXT,
  ref_description TEXT,
  conflict_type TEXT NOT NULL,
  notes TEXT,
  resolved INTEGER DEFAULT 0,
  resolution TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_rental_property ON rental_ledger(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_date ON rental_ledger(date);
CREATE INDEX IF NOT EXISTS idx_levy_property ON levy_ledger(property_id);
CREATE INDEX IF NOT EXISTS idx_bank_property ON bank_ledger(property_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_property ON reconciliation(property_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_period ON reconciliation(period);
CREATE INDEX IF NOT EXISTS idx_work_orders_property ON work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_property ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);
CREATE INDEX IF NOT EXISTS idx_conflicts_property ON ledger_conflicts(property_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_type ON ledger_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON ledger_conflicts(resolved);
