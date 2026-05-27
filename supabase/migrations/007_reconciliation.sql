-- 007_reconciliation.sql
create type recon_status as enum ('matched','unmatched','exception','pending');

create table reconciliation (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  period text not null,
  rental_amount numeric(12,2),
  bank_amount numeric(12,2),
  variance numeric(12,2) generated always as (coalesce(bank_amount,0) - coalesce(rental_amount,0)) stored,
  status recon_status not null default 'pending',
  notes text,
  created_at timestamptz default now()
);

create index on reconciliation(property_id, period);
alter table reconciliation enable row level security;
