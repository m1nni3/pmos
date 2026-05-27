-- seed.sql — real property data from portfolio

-- ── Contacts ──────────────────────────────────────────────────────────

insert into contacts (role, name, email, phone, address, notes) values
  ('managing_agent', 'Trafalgar Property Management (Pty) Ltd', 'melissadv@trafalgar.co.za', '021 410 5500',
   'Cape Town', 'Oversees Oakdale (SS141) & Villeroy Court (SS1240/2007); Portfolio Manager: Melissa de Villiers'),
  ('managing_agent', 'HuurKor Admin / HK Admin', 'indaba@hkadmin.co.za', '012 88 44 840',
   'Unit 105, Universal 632005', 'Oversees Indaba (SS310/1995); Contact: Vincent Moela'),
  ('managing_agent', 'GEORGE RENNIE TRUST', null, null,
   null, 'Body corporate for Malindi (SS394/1990)'),
  ('letting_agent', 'Trafalgar Property Management (Pty) Ltd — Lettings', 'melissadv@trafalgar.co.za', '021 410 5500',
   'Via Trafalgar', 'Letting agent for Oakdale; 10% fee auto-deducted'),
  ('letting_agent', 'Trafalgar Property Management — Villeroy', 'jacquelinem@trafalgar.co.za', null,
   'Thibault Square, Branch 20909', 'Letting agent for Villeroy Court'),
  ('municipality', 'City of Cape Town', 'accounts@capetown.gov.za', '0860 103 089',
   null, 'Municipal valuation: R 1 250 000 (2023); Acc: 207891705 (paid by letting agent)'),
  ('municipality', 'Ekurhuleni', 'call.centre@ekurhuleni.gov.za', '0860 543 000',
   null, 'Municipal valuation: R 383 000 (2025); paid by owner'),
  ('municipality', 'City of Tshwane', 'customercare@tshwane.gov.za', '(012) 358 9999',
   null, 'Municipal valuation: R 400 000 (2025); paid by owner'),
  ('municipality', 'City of Johannesburg', 'Joburgconnect@joburg.org.za', '086 099 5150',
   null, 'Municipal valuation: R 1 102 000 (2023); paid by owner'),
  ('bank', 'CIB (Pty) Ltd', null, '0861225225',
   null, 'Insurer for Oakdale; Broker: Addlease (Pty) Ltd T/A Addsure; Policy SB\\SR646772');

-- ── Properties ────────────────────────────────────────────────────────

with props as (
  insert into properties (name, address, scheme_name, unit_count, managing_agent_id, letting_agent_id)
  select
    'Oakdale',
    '66 Main Rd, Plumstead, Cape Town, 7801',
    'SS OAKDALE (SS141)',
    1,
    (select id from contacts where name = 'Trafalgar Property Management (Pty) Ltd' limit 1),
    (select id from contacts where name = 'Trafalgar Property Management (Pty) Ltd — Lettings' limit 1)
  where not exists (select 1 from properties where name = 'Oakdale')

  union all

  select
    'Malindi',
    '5 Long St, Kempton Park Cbd, Kempton Park, 1619',
    'SS MALINDI (SS394/1990)',
    1,
    (select id from contacts where name = 'GEORGE RENNIE TRUST' limit 1),
    null
  where not exists (select 1 from properties where name = 'Malindi')

  union all

  select
    'Indaba',
    '321 Frederick St, Pretoria West, Pretoria, 0183',
    'SS INDABA (SS310/1995)',
    1,
    (select id from contacts where name = 'HuurKor Admin / HK Admin' limit 1),
    null
  where not exists (select 1 from properties where name = 'Indaba')

  union all

  select
    'Villeroy',
    'Invicta Rd, Halfway Gardens Ext 103, Johannesburg, 2000',
    'SS VILLEROY COURT (SS1240/2007)',
    1,
    (select id from contacts where name = 'Trafalgar Property Management (Pty) Ltd' limit 1),
    (select id from contacts where name = 'Trafalgar Property Management — Villeroy' limit 1)
  where not exists (select 1 from properties where name = 'Villeroy')
  returning id, name
)
insert into units (property_id, unit_number, tenant_name, monthly_rental, lease_end)
select
  (select id from props where name = 'Oakdale'),
  '59 / 304',
  'Ravens',
  0,
  '2026-04-30'
where exists (select 1 from props where name = 'Oakdale')
  and not exists (select 1 from units where property_id = (select id from props where name = 'Oakdale'));

with props as (
  select id, name from properties
)
insert into units (property_id, unit_number, tenant_name, monthly_rental)
select id, '15 / D26', null, 0 from props where name = 'Malindi'
  and not exists (select 1 from units where property_id = (select id from properties where name = 'Malindi'));

with props as (
  select id, name from properties
)
insert into units (property_id, unit_number, tenant_name, monthly_rental)
select id, '5 / 105', null, 0 from props where name = 'Indaba'
  and not exists (select 1 from units where property_id = (select id from properties where name = 'Indaba'));

with props as (
  select id, name from properties
)
insert into units (property_id, unit_number, tenant_name, monthly_rental)
select id, '135', null, 0 from props where name = 'Villeroy'
  and not exists (select 1 from units where property_id = (select id from properties where name = 'Villeroy'));
