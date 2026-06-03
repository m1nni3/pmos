-- Create tables for the PMOS property management system

-- ─────────────────────────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  scheme_name TEXT,
  unit_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- UNITS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- ─────────────────────────────────────────────────────────────
-- CONTACTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  account_number TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- WORK ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_orders (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  unit_id TEXT,
  contractor_id TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  raised_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  cost REAL,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (contractor_id) REFERENCES contacts(id)
);

-- ─────────────────────────────────────────────────────────────
-- RECONCILIATION
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliation (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  period TEXT NOT NULL,
  rental_amount REAL,
  bank_amount REAL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- ─────────────────────────────────────────────────────────────
-- LEDGER TABLES
-- ──────────────────��──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS levy_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS municipality_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE IF NOT EXISTS bank_ledger (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  balance REAL,
  reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Properties
INSERT INTO properties (id, name, address, scheme_name, unit_count) VALUES
  ('prop-001', 'Sunrise Apartments', '123 Oak Street, Downtown', 'Sunrise Scheme', 3),
  ('prop-002', 'Greenfield Estates', '456 Elm Avenue, Midtown', 'Green Scheme', 2),
  ('prop-003', 'Riverside Complex', '789 River Road, Waterfront', 'River Scheme', 1);

-- Units
INSERT INTO units (id, property_id, unit_number, unit_type) VALUES
  ('unit-001', 'prop-001', '101', 'Apartment'),
  ('unit-002', 'prop-001', '102', 'Apartment'),
  ('unit-003', 'prop-001', '103', 'Apartment'),
  ('unit-004', 'prop-002', '201', 'Apartment'),
  ('unit-005', 'prop-002', '202', 'Apartment'),
  ('unit-006', 'prop-003', '301', 'Penthouse');

-- Contacts
INSERT INTO contacts (id, role, name, email, phone, address, account_number, notes) VALUES
  ('contact-001', 'Contractor', 'John Smith', 'john@example.com', '555-0101', '100 Main St', 'ACC001', 'Plumbing specialist'),
  ('contact-002', 'Tenant', 'Jane Doe', 'jane@example.com', '555-0102', '101 Oak St', 'TENANT001', 'Sunrise Apartments 101'),
  ('contact-003', 'Property Manager', 'Bob Johnson', 'bob@example.com', '555-0103', '500 Office Blvd', 'MGR001', 'Managing all properties'),
  ('contact-004', 'Contractor', 'Alice Williams', 'alice@example.com', '555-0104', '200 Service Ave', 'ACC002', 'Electrical specialist');

-- Work Orders
INSERT INTO work_orders (id, property_id, unit_id, contractor_id, description, status, raised_at) VALUES
  ('wo-001', 'prop-001', 'unit-001', 'contact-001', 'Fix leaking bathroom tap', 'open', datetime('now', '-5 days')),
  ('wo-002', 'prop-002', 'unit-004', 'contact-004', 'Replace ceiling light fixture', 'open', datetime('now', '-2 days'));

-- Reconciliation
INSERT INTO reconciliation (id, property_id, period, rental_amount, bank_amount, status, notes) VALUES
  ('recon-001', 'prop-001', '2026-05', 3500.00, 3450.00, 'pending', 'Minor variance to investigate'),
  ('recon-002', 'prop-002', '2026-05', 2100.00, 2100.00, 'pending', 'Perfect match');

-- Rental Ledger
INSERT INTO rental_ledger (id, property_id, date, description, debit, credit, balance, reference) VALUES
  ('rental-001', 'prop-001', '2026-05-01', 'May rental collection', 0, 3500.00, 3500.00, 'REN-001'),
  ('rental-002', 'prop-001', '2026-05-15', 'Late payment - Unit 102', 0, 500.00, 4000.00, 'REN-002'),
  ('rental-003', 'prop-002', '2026-05-01', 'May rental collection', 0, 2100.00, 2100.00, 'REN-003');

-- Bank Ledger
INSERT INTO bank_ledger (id, property_id, date, description, debit, credit, balance, reference) VALUES
  ('bank-001', 'prop-001', '2026-05-01', 'Deposit', 0, 3500.00, 3500.00, 'BANK-001'),
  ('bank-002', 'prop-001', '2026-05-10', 'Maintenance expense', 150.00, 0, 3350.00, 'BANK-002'),
  ('bank-003', 'prop-002', '2026-05-01', 'Deposit', 0, 2100.00, 2100.00, 'BANK-003');
