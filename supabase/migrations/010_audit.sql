-- 010_audit.sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid,
  performed_at timestamptz default now()
);
