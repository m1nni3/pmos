-- D1 seed data
-- Run: wrangler d1 execute pmos-db --remote --file supabase/d1-seed.sql

-- Contacts
insert or ignore into contacts (id, role, name, email, phone, address, notes) values
  ('c1000000-0000-0000-0000-000000000001', 'managing_agent', 'Trafalgar Property Management (Pty) Ltd', 'melissadv@trafalgar.co.za', '021 410 5500', 'Cape Town', 'Oversees Oakdale & Villeroy Court; Portfolio Manager: Melissa de Villiers'),
  ('c1000000-0000-0000-0000-000000000002', 'managing_agent', 'HuurKor Admin / HK Admin', 'indaba@hkadmin.co.za', '012 88 44 840', 'Unit 105, Universal 632005', 'Oversees Indaba; Contact: Vincent Moela'),
  ('c1000000-0000-0000-0000-000000000003', 'managing_agent', 'GEORGE RENNIE TRUST', null, null, null, 'Body corporate for Malindi'),
  ('c1000000-0000-0000-0000-000000000004', 'letting_agent', 'Trafalgar — Lettings (Oakdale)', 'melissadv@trafalgar.co.za', '021 410 5500', 'Via Trafalgar', '10% fee auto-deducted'),
  ('c1000000-0000-0000-0000-000000000005', 'letting_agent', 'Trafalgar — Villeroy', 'jacquelinem@trafalgar.co.za', null, 'Thibault Square, Branch 20909', null),
  ('c1000000-0000-0000-0000-000000000006', 'municipality', 'City of Cape Town', 'accounts@capetown.gov.za', '0860 103 089', null, 'Valuation: R 1 250 000 (2023); Acc: 207891705'),
  ('c1000000-0000-0000-0000-000000000007', 'municipality', 'Ekurhuleni', 'call.centre@ekurhuleni.gov.za', '0860 543 000', null, 'Valuation: R 383 000 (2025); paid by owner'),
  ('c1000000-0000-0000-0000-000000000008', 'municipality', 'City of Tshwane', 'customercare@tshwane.gov.za', '(012) 358 9999', null, 'Valuation: R 400 000 (2025)'),
  ('c1000000-0000-0000-0000-000000000009', 'municipality', 'City of Johannesburg', 'Joburgconnect@joburg.org.za', '086 099 5150', null, 'Valuation: R 1 102 000 (2023)');

-- Properties
insert or ignore into properties (id, name, address, scheme_name, unit_count, managing_agent_id, letting_agent_id) values
  ('p1000000-0000-0000-0000-000000000001', 'Oakdale', '66 Main Rd, Plumstead, Cape Town, 7801', 'SS OAKDALE (SS141)', 1, 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000002', 'Malindi', '5 Long St, Kempton Park Cbd, Kempton Park, 1619', 'SS MALINDI (SS394/1990)', 1, 'c1000000-0000-0000-0000-000000000003', null),
  ('p1000000-0000-0000-0000-000000000003', 'Indaba', '321 Frederick St, Pretoria West, Pretoria, 0183', 'SS INDABA (SS310/1995)', 1, 'c1000000-0000-0000-0000-000000000002', null),
  ('p1000000-0000-0000-0000-000000000004', 'Villeroy', 'Invicta Rd, Halfway Gardens Ext 103, Johannesburg, 2000', 'SS VILLEROY COURT (SS1240/2007)', 1, 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005');

-- Units
insert or ignore into units (id, property_id, unit_number, tenant_name, monthly_rental, lease_end) values
  ('u1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '59 / 304', 'Ravens', 0, '2026-04-30'),
  ('u1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', '15 / D26', null, 0, null),
  ('u1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', '5 / 105', null, 0, null),
  ('u1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', '135', null, 0, null);
