INSERT INTO properties (name, address, type, units) VALUES
  ('The Pines', '123 Main St, Sandton', 'residential', 12),
  ('Central Plaza', '45 Oak Ave, Rosebank', 'commercial', 6),
  ('Harbour View', '78 Bay Rd, Cape Town', 'mixed', 24);

INSERT INTO units (property_id, unit_number, tenant_name, rent_amount, deposit_amount, status)
SELECT id, '101', 'Alice Molefe', 12500, 25000, 'occupied' FROM properties WHERE name = 'The Pines'
UNION ALL
SELECT id, '102', 'Bob Khumalo', 11000, 22000, 'occupied' FROM properties WHERE name = 'The Pines'
UNION ALL
SELECT id, '201', NULL, 15000, 30000, 'vacant' FROM properties WHERE name = 'The Pines';

INSERT INTO managing_agents (name, email, phone, commission_rate) VALUES
  ('PrimeManage SA', 'info@primemanage.co.za', '011-555-0100', 8.5);

INSERT INTO letting_agents (name, email, phone, commission_rate) VALUES
  ('LetCo Properties', 'info@letco.co.za', '011-555-0200', 10.0);

INSERT INTO municipalities (name, account_number, rates_payable) VALUES
  ('City of Johannesburg', 'JHB-2024-001', 45000),
  ('City of Cape Town', 'CPT-2024-002', 32000);

INSERT INTO banks (name, branch_code, account_number, account_type) VALUES
  ('First National Bank', '255005', '62800012345', 'trust');

INSERT INTO contractors (name, trade, rating) VALUES
  ('FixIt Plumbing', 'plumber', 4),
  ('ElecPro Solutions', 'electrician', 5);
