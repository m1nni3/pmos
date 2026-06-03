-- Migration 003: Add tables for Petty Cash, P&L, Property Editing, Contacts, Documents

create table if not exists property_details (
  id text primary key,
  property_id text not null references properties(id) on delete cascade unique,
  unit_number text, door_number text, erf_number text, scheme_number text,
  size_sqm real, bedrooms integer, bathrooms integer, parking_bays integer,
  suburb text, township text, lpi_code text,
  purchase_date text, purchase_price real, current_market_value real,
  title_deed_reference text, owner_name text, owner_id text, registered_owner text,
  municipality_name text, municipal_valuation text, municipal_valuation_year text,
  municipal_account_number text, municipal_paid_by text,
  agency text, managing_agent_name text, portfolio_manager text,
  agent_email text, agent_phone text, account_administrator text,
  maintenance_manager text, department_head text, management_fee text,
  payment_method text, branch text, branch_code text,
  tenant_name text, tenant_phone text, tenant_email text, tenant_notes text,
  bc_name text, bc_registration_number text, bc_bank text,
  bc_account_name text, bc_branch text, bc_branch_code text,
  bc_levy_reference text, bc_levy_payment_method text,
  bc_contact_name text, bc_contact_phone text, bc_contact_email text,
  bond_bank text, bond_account_number text, original_bond_amount real,
  monthly_bond_payment real, expected_payoff_date text,
  insurer text, broker text, policy_number text, policy_holder text,
  geyser_excess real, annual_renewal_date text, insurance_contact text,
  emergency_contact_name text, emergency_contact_phone text,
  emergency_contact_email text, emergency_contact_notes text
);

create table if not exists property_contacts (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  category text not null check(category in ('emergency','service_provider','professional')),
  subcategory text,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists property_documents (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  name text not null,
  category text not null,
  file_url text,
  mime_type text,
  size_bytes integer,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists valuation_history (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  value real not null,
  date text not null,
  source text,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists property_history (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  event_date text not null,
  created_at text default (datetime('now'))
);

create table if not exists petty_cash_income (
  id text primary key,
  property_id text references properties(id) on delete set null,
  date text not null,
  description text not null,
  amount real not null,
  category text,
  receipt_url text,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists petty_cash_expenses (
  id text primary key,
  property_id text references properties(id) on delete set null,
  date text not null,
  description text not null,
  amount real not null,
  category text,
  vat_inclusive integer not null default 1,
  supplier text,
  receipt_url text,
  notes text,
  created_at text default (datetime('now'))
);

create table if not exists budgets (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  year integer not null,
  month integer not null,
  category text not null,
  budget_amount real not null,
  created_at text default (datetime('now'))
);
create unique index if not exists idx_budgets_unique on budgets(property_id, year, month, category);

-- Seed property_details from existing properties data
insert or ignore into property_details (id, property_id, unit_number, door_number, purchase_date, purchase_price)
select 'pd-' || p.id, p.id, u.unit_number, u.unit_number, '2024-01-01', 0
from properties p left join units u on u.property_id = p.id;
