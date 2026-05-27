-- 002_contacts.sql
create type contact_role as enum ('managing_agent','letting_agent','municipality','bank','contractor');

create table contacts (
  id uuid primary key default gen_random_uuid(),
  role contact_role not null,
  name text not null,
  email text,
  phone text,
  address text,
  account_number text,
  notes text,
  created_at timestamptz default now()
);

alter table contacts enable row level security;
