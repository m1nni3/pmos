-- 003_rental_ledger.sql
create table rental_ledger (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  date date not null,
  description text not null,
  debit numeric(12,2) not null default 0,
  credit numeric(12,2) not null default 0,
  balance numeric(12,2) not null default 0,
  reference text,
  imported_at timestamptz default now()
);
create index on rental_ledger(property_id, date);
alter table rental_ledger enable row level security;
