-- 009_documents.sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes int,
  uploaded_at timestamptz default now()
);

alter table documents enable row level security;
