-- 008_maintenance.sql
create type work_order_status as enum ('open','in_progress','completed','cancelled');

create table work_orders (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  unit_id uuid references units(id),
  contractor_id uuid references contacts(id),
  description text not null,
  status work_order_status not null default 'open',
  raised_at timestamptz default now(),
  completed_at timestamptz,
  cost numeric(12,2)
);

alter table work_orders enable row level security;
