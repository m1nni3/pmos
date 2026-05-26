-- 001_properties.sql
create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  scheme_name text,
  unit_count int not null default 1,
  managing_agent_id uuid,
  letting_agent_id uuid,
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  unit_number text not null,
  tenant_name text,
  monthly_rental numeric(12,2) not null default 0,
  lease_start date,
  lease_end date
);

alter table properties enable row level security;
alter table units enable row level security;
