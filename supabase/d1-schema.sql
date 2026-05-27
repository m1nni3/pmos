-- D1-compatible schema (SQLite)
-- Run: wrangler d1 execute pmos-db --file supabase/d1-schema.sql

create table if not exists properties (
  id text primary key,
  name text not null,
  address text not null,
  scheme_name text,
  unit_count integer not null default 1,
  managing_agent_id text,
  letting_agent_id text,
  created_at text default (datetime('now'))
);

create table if not exists units (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  unit_number text not null,
  tenant_name text,
  monthly_rental real not null default 0,
  lease_start text,
  lease_end text
);

create table if not exists contacts (
  id text primary key,
  role text not null check(role in ('managing_agent','letting_agent','municipality','bank','contractor')),
  name text not null,
  email text,
  phone text,
  address text,
  account_number text,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists rental_ledger (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  date text not null,
  description text not null,
  debit real not null default 0,
  credit real not null default 0,
  balance real not null default 0,
  reference text,
  imported_at text default (datetime('now'))
);
create index if not exists idx_rental_ledger_property on rental_ledger(property_id, date);

create table if not exists levy_ledger (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  date text not null,
  description text not null,
  debit real not null default 0,
  credit real not null default 0,
  balance real not null default 0,
  reference text,
  imported_at text default (datetime('now'))
);
create index if not exists idx_levy_ledger_property on levy_ledger(property_id, date);

create table if not exists municipality_ledger (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  date text not null,
  description text not null,
  debit real not null default 0,
  credit real not null default 0,
  balance real not null default 0,
  reference text,
  imported_at text default (datetime('now'))
);
create index if not exists idx_municipality_ledger_property on municipality_ledger(property_id, date);

create table if not exists bank_ledger (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  date text not null,
  description text not null,
  debit real not null default 0,
  credit real not null default 0,
  balance real not null default 0,
  reference text,
  imported_at text default (datetime('now'))
);
create index if not exists idx_bank_ledger_property on bank_ledger(property_id, date);

create table if not exists reconciliation (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  period text not null,
  rental_amount real,
  bank_amount real,
  status text not null default 'pending' check(status in ('matched','unmatched','exception','pending')),
  notes text,
  created_at text default (datetime('now'))
);
create index if not exists idx_reconciliation_property on reconciliation(property_id, period);

create table if not exists work_orders (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  unit_id text references units(id),
  contractor_id text references contacts(id),
  description text not null,
  status text not null default 'open' check(status in ('open','in_progress','completed','cancelled')),
  raised_at text default (datetime('now')),
  completed_at text,
  cost real
);

create table if not exists documents (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes integer,
  uploaded_at text default (datetime('now'))
);

create table if not exists audit_log (
  id text primary key,
  table_name text not null,
  record_id text,
  action text not null,
  old_data text,
  new_data text,
  performed_by text,
  performed_at text default (datetime('now'))
);
