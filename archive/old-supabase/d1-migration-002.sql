create table if not exists property_details (
  id text primary key,
  property_id text not null references properties(id) on delete cascade unique,

  unit_number text, door_number text, erf_number text, scheme_number text,
  size_sqm real, bedrooms integer, bathrooms integer, parking_bays integer,
  suburb text, township text, lpi_code text,
  purchase_date text, purchase_price real, current_market_value real,
  title_deed_reference text, owner_name text, owner_id text, registered_owner text,
  municipality_name text, municipal_valuation text, municipal_valuation_year text,
  municipal_account_number text, municipal_paid_by text,
  agency text, managing_agent_name text, portfolio_manager text,
  agent_email text, agent_phone text, account_administrator text,
  maintenance_manager text, department_head text, management_fee text,
  payment_method text, branch text, branch_code text,
  tenant_name text, tenant_phone text, tenant_email text, tenant_notes text,
  bc_name text, bc_registration_number text, bc_bank text,
  bc_account_name text, bc_branch text, bc_branch_code text,
  bc_levy_reference text, bc_levy_payment_method text,
  bc_contact_name text, bc_contact_phone text, bc_contact_email text,
  bond_bank text, bond_account_number text, original_bond_amount real,
  monthly_bond_payment real, expected_payoff_date text,
  insurer text, broker text, policy_number text, policy_holder text,
  geyser_excess real, annual_renewal_date text, insurance_contact text,
  emergency_contact_name text, emergency_contact_phone text,
  emergency_contact_email text, emergency_contact_notes text
);

-- Oakdale
insert or ignore into property_details (id, property_id,
  unit_number, door_number, erf_number, scheme_number, size_sqm, suburb, township, lpi_code,
  purchase_date, purchase_price, current_market_value,
  municipality_name, municipal_valuation, municipal_valuation_year, municipal_account_number, municipal_paid_by,
  agency, managing_agent_name, portfolio_manager, agent_email, agent_phone, account_administrator, maintenance_manager, department_head, management_fee, payment_method, branch,
  tenant_name, tenant_notes,
  bc_name, bc_levy_payment_method,
  insurer, broker, policy_number, policy_holder, geyser_excess, annual_renewal_date, insurance_contact,
  emergency_contact_name, emergency_contact_notes)
values (
  'pd0000001', (select id from properties where name = 'Oakdale'),
  '59', '304', '73748', 'SS141', 81, 'Plumstead', 'Cape Town', 'C01600070007374800000',
  '2004-06-28', 330000, 1510000,
  'City of Cape Town', 'R 1 250 000', '2023', '207891705', 'Letting Agent',
  'Trafalgar Property Management (Pty) Ltd', 'Trafalgar Property Management (Pty) Ltd', 'Melissa de Villiers', 'melissadv@trafalgar.co.za', '021 410 5500', 'Michelle Van Rooyen', 'Adeeb October', 'Colleen von Buchenroder', '10%+ Banking Charges+ VAT', 'Auto Deducted', 'Via Trafalgar',
  'Ravens (Oakdale 304)', 'Lease to 30 Apr 2026',
  'Managed via Trafalgar', 'deducting from rental by letting agent',
  'CIB (Pty) Ltd.', 'Addlease (Pty) Ltd T/A Addsure', 'SB\\SR646772', 'OAKDALE BODY CORPORATE', 2000, 'YYYY-00-DD 00:00:SS', '0861225225',
  'Property Emergency', 'After Hours'
);

-- Malindi
insert or ignore into property_details (id, property_id,
  unit_number, door_number, erf_number, scheme_number, size_sqm, suburb, township, lpi_code,
  purchase_date, purchase_price, current_market_value,
  municipality_name, municipal_valuation, municipal_valuation_year, municipal_account_number, municipal_paid_by,
  management_fee, payment_method,
  bc_name,
  emergency_contact_name, emergency_contact_notes)
values (
  'pd0000002', (select id from properties where name = 'Malindi'),
  '15', 'D26', '2657', 'SS394/1990', 55, 'Kempton Park CBD', 'Kempton Park', 'T0IR03520000265700000',
  '2005-06-13', 218000, 320000,
  'Ekurhuleni', 'R 383 000', '2025', '-', 'Owner',
  '10% (deducted automatically)', null,
  'GEORGE RENNIE TRUST',
  'Property Emergency', 'After Hours'
);

-- Indaba
insert or ignore into property_details (id, property_id,
  unit_number, door_number, erf_number, scheme_number, size_sqm, suburb, township, lpi_code,
  purchase_date, purchase_price, current_market_value,
  municipality_name, municipal_valuation, municipal_valuation_year,
  managing_agent_name, portfolio_manager, agent_email, agent_phone, management_fee, payment_method, branch, branch_code,
  bc_name, bc_registration_number, bc_bank, bc_account_name, bc_branch, bc_branch_code, bc_levy_reference, bc_levy_payment_method, bc_contact_name, bc_contact_phone, bc_contact_email,
  insurance_contact,
  emergency_contact_name, emergency_contact_notes)
values (
  'pd0000003', (select id from properties where name = 'Indaba'),
  '5', '105', '1591', 'SS310/1995', 77, 'Pretoria West', 'Pretoria', 'T0JR01990000159100001',
  '2005-06-28', 170000, 440000,
  'City of Tshwane', 'R 400 000', '2025',
  'HuurKor Admin / HK Admin', 'Vincent Moela', 'indaba@hkadmin.co.za', '0642-00105-01', '10% of Rental Income', 'TBA', 'UNIVERSAL', '632005',
  'Indaba (VM) Body Corporate', '310/1995', 'ABSA', 'HUURKOR ADMIN (PTY) LTD', 'UNIVERSAL', '632005', '0642-00105-01', 'deducting from rental by letting agent', 'Huurkor Admin (Indaba)', '012 88 44 840/1/2', 'indaba@hkadmin.co.za',
  'INSURANCE',
  'Property Emergency', 'After Hours'
);

-- Villeroy
insert or ignore into property_details (id, property_id,
  unit_number, door_number, erf_number, scheme_number, size_sqm, bedrooms, bathrooms, parking_bays, suburb, township, lpi_code,
  purchase_date, purchase_price, current_market_value,
  municipality_name, municipal_valuation, municipal_valuation_year, municipal_paid_by,
  agency, managing_agent_name, portfolio_manager, agent_email, branch, branch_code,
  bc_name, bc_registration_number, bc_bank, bc_account_name, bc_branch, bc_branch_code, bc_levy_reference, bc_levy_payment_method,
  emergency_contact_name, emergency_contact_notes)
values (
  'pd0000004', (select id from properties where name = 'Villeroy'),
  '135', '135', '1378', 'SS1240/2007', 46, 1, 1, 1, 'Halfway Gardens', 'Halfway Gardens Ext 103', 'T0JR01000000137800000',
  '2005-07-06', 339900, 520000,
  'City of Johannesburg', 'R 1 102 000', '2023', 'Owner',
  'Trafalgar Property Management', 'Trafalgar Property Management (Pty) Ltd', 'Jacqueline Marais', 'jacquelinem@trafalgar.co.za', 'Thibault Square', '20909',
  'SS Villeroy', 'SS1240/2007', 'Standard Bank', 'Trafalgar Property Management', 'Thibault Square', '20909', '99550135000', 'deducting from rental by letting agent',
  'Property Emergency', 'After Hours'
);
