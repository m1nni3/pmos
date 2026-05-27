-- seed.sql — sample data for development
insert into contacts (role, name, email, phone) values
  ('managing_agent', 'Apex Property Management', 'admin@apex.co.za', '021 000 0001'),
  ('letting_agent',  'Prime Lets',               'info@primlets.co.za', '021 000 0002'),
  ('municipality',  'City of Cape Town',          null, null),
  ('bank',          'FNB Property Trust',         null, null);

insert into properties (name, address, scheme_name, unit_count) values
  ('Harbour View',  '1 Harbour Rd, Cape Town', 'Harbour View Body Corporate', 8),
  ('Greenfields',   '42 Oak Ave, Bellville',   null, 4);
