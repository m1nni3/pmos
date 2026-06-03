-- Phase 1: Portfolio expansion tables

create table if not exists bonds (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  bank text,
  account_number text,
  original_amount real,
  monthly_payment real,
  expected_payoff_date text,
  payment_method text,
  provider_name text,
  provider_phone text,
  provider_email text,
  provider_notes text,
  created_at text default (datetime('now'))
);

create table if not exists insurance_policies (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  insurer text,
  broker text,
  policy_number text,
  policy_holder text,
  renewal_date text,
  geyser_excess real,
  notes text,
  status text not null default 'active' check(status in ('active','expiring_soon','expired')),
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

create table if not exists property_history (
  id text primary key,
  property_id text not null references properties(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  event_date text not null,
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
