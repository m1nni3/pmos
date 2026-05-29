-- Run: wrangler d1 execute pmos-db --remote --file supabase/d1-migration-004.sql

-- This script populates the remaining empty tables: bonds, insurance_policies,
-- valuation_history, property_contacts, property_history, property_documents,
-- work_orders, reconciliation

-- ── Bonds ──────────────────────────────────────────────────────
insert or ignore into bonds (id, property_id, bank, account_number, original_amount, monthly_payment, expected_payoff_date, payment_method, provider_name, provider_phone, provider_email, provider_notes) values
  ('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'ABSA', '9078123456', 240000, 3200, '2030-06-01', 'Debit Order', 'ABSA Home Loans', '0860 002 272', 'homeloans@absa.co.za', 'Bond registered 2004'),
  ('b1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'ABSA', '0642-00105-01', 120000, 1800, '2028-12-01', 'Auto Deducted', 'ABSA Home Loans', '0860 002 272', 'homeloans@absa.co.za', 'Paid via HuurKor Admin'),
  ('b1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000004', 'Standard Bank', '99550135000', 300000, 4100, '2032-01-01', 'Debit Order', 'Standard Bank HomeLoans', '0860 123 000', 'homenet@standardbank.co.za', 'Bond registered 2005');

-- ── Insurance Policies ─────────────────────────────────────────
insert or ignore into insurance_policies (id, property_id, insurer, broker, policy_number, policy_holder, renewal_date, geyser_excess, notes, status) values
  ('i1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'CIB (Pty) Ltd.', 'Addlease (Pty) Ltd T/A Addsure', 'SB\\SR646772', 'OAKDALE BODY CORPORATE', '2026-06-01', 2000, 'Building insurance via Trafalgar', 'active'),
  ('i1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'Mutual & Federal', 'Huurkor Admin', 'HKI-2025-INDABA', 'INDABA BODY CORPORATE (SS310/1995)', '2026-07-15', 1500, 'Policy managed by HuurKor', 'active'),
  ('i1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000004', 'CIB (Pty) Ltd.', 'Addlease (Pty) Ltd T/A Addsure', 'SB\\SR775890', 'SS VILLEROY', '2026-05-01', 2000, 'Building insurance via Trafalgar', 'expiring_soon'),
  ('i1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', 'Old Mutual', 'Direct', 'OM-MAL-2025-01', null, '2026-10-01', 1000, 'Building insurance', 'active');

-- ── Valuation History ──────────────────────────────────────────
insert or ignore into valuation_history (id, property_id, value, date, source, notes) values
  ('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 1250000, '2023-07-01', 'Municipal Valuation', 'City of Cape Town valuation'),
  ('v1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 1510000, '2025-01-01', 'Market Appraisal', 'Updated by Trafalgar'),
  ('v1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000002', 383000, '2025-01-01', 'Municipal Valuation', 'Ekurhuleni valuation'),
  ('v1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000003', 400000, '2025-01-01', 'Municipal Valuation', 'City of Tshwane valuation'),
  ('v1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000003', 440000, '2026-01-01', 'Market Appraisal', 'Updated by HuurKor Admin'),
  ('v1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000004', 1102000, '2023-07-01', 'Municipal Valuation', 'City of Johannesburg valuation'),
  ('v1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000004', 520000, '2025-06-01', 'Market Appraisal', 'Updated by Trafalgar');

-- ── Property Contacts ──────────────────────────────────────────
insert or ignore into property_contacts (id, property_id, category, subcategory, name, phone, email, notes) values
  ('pc1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'emergency', 'After Hours', 'Property Emergency', '0860 123 456', null, 'City of Cape Town emergency line'),
  ('pc1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'service_provider', 'Plumber', 'Quick Fix Plumbing', '021 555 1234', 'info@quickfix.co.za', 'Preferred plumber via Trafalgar'),
  ('pc1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'service_provider', 'Electrician', 'Spark Electric', '021 555 5678', 'dispatch@sparkelectric.co.za', 'Licensed electrician'),
  ('pc1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'professional', 'Property Manager', 'Melissa de Villiers', '021 410 5500', 'melissadv@trafalgar.co.za', 'Portfolio manager at Trafalgar'),
  ('pc1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000001', 'professional', 'Account Admin', 'Michelle Van Rooyen', '021 410 5500', null, 'Account administrator'),
  ('pc1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', 'emergency', 'After Hours', 'Property Emergency', '011 999 0000', null, 'Ekurhuleni emergency'),
  ('pc1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000002', 'service_provider', 'Handyman', 'Kempton Repairs', '011 555 7890', 'info@kemptonrepairs.co.za', 'General maintenance'),
  ('pc1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000003', 'emergency', 'After Hours', 'Property Emergency', '012 555 0000', null, 'Pretoria emergency'),
  ('pc1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000003', 'service_provider', 'Plumber', 'Pretoria Plumbing', '012 555 1111', 'bookings@pretoriaplumbing.co.za', 'Preferred by HuurKor'),
  ('pc1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000003', 'professional', 'Portfolio Manager', 'Vincent Moela', '012 88 44 840', 'indaba@hkadmin.co.za', 'Contact at HuurKor Admin'),
  ('pc1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000004', 'emergency', 'After Hours', 'Property Emergency', '0860 999 000', null, 'Joburg emergency'),
  ('pc1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000004', 'professional', 'Property Manager', 'Jacqueline Marais', '021 410 5500', 'jacquelinem@trafalgar.co.za', 'Villeroy portfolio manager');

-- ── Property History ───────────────────────────────────────────
insert or ignore into property_history (id, property_id, event_type, title, description, event_date) values
  ('h1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'purchase', 'Property Acquired', 'Oakdale unit 59/304 purchased for R330,000', '2004-06-28'),
  ('h1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'valuation', 'Market Valuation Update', 'Market value updated to R1,510,000 by Trafalgar', '2025-01-15'),
  ('h1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'inspection', 'Annual Inspection', 'Property inspection completed. No major issues found.', '2025-11-20'),
  ('h1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'lease', 'Lease Renewed', 'Tenant Ravens lease renewed to 30 Apr 2026', '2025-04-15'),
  ('h1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', 'purchase', 'Property Acquired', 'Malindi D26 purchased for R218,000', '2005-06-13'),
  ('h1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', 'maintenance', 'Geyser Replacement', 'Geyser replaced with 150L Kwikot unit', '2025-03-10'),
  ('h1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000003', 'purchase', 'Property Acquired', 'Indaba unit 105 purchased for R170,000', '2005-06-28'),
  ('h1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000003', 'valuation', 'Market Valuation Update', 'Market value updated to R440,000 by HuurKor Admin', '2026-01-10'),
  ('h1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000003', 'note', 'Managing Agent Change', 'Management transferred to HuurKor Admin', '2023-08-01'),
  ('h1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000004', 'purchase', 'Property Acquired', 'Villeroy Court unit 135 purchased for R339,900', '2005-07-06'),
  ('h1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000004', 'inspection', 'Annual Inspection', 'Queries regarding geyser and window seals noted', '2025-10-15');

-- ── Property Documents ─────────────────────────────────────────
insert or ignore into property_documents (id, property_id, name, category, file_url, mime_type, size_bytes, notes) values
  ('d1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Title Deed - Oakdale 304', 'legal', '/docs/oakdale-title-deed.pdf', 'application/pdf', 245000, 'Original title deed from 2004'),
  ('d1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'Lease Agreement - Ravens', 'lease', '/docs/oakdale-lease-ravens.pdf', 'application/pdf', 120000, 'Signed lease to 30 Apr 2026'),
  ('d1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'Insurance Policy Schedule', 'insurance', '/docs/oakdale-insurance.pdf', 'application/pdf', 85000, 'CIB policy SB\\SR646772'),
  ('d1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000003', 'Title Deed - Indaba 105', 'legal', '/docs/indaba-title-deed.pdf', 'application/pdf', 230000, 'Original title deed from 2005'),
  ('d1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000003', 'Managing Agent Agreement - HuurKor', 'legal', '/docs/indaba-agent-agreement.pdf', 'application/pdf', 95000, 'Management agreement with HuurKor Admin'),
  ('d1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000004', 'Title Deed - Villeroy 135', 'legal', '/docs/villeroy-title-deed.pdf', 'application/pdf', 240000, 'Original title deed from 2005'),
  ('d1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000002', 'Municipal Account Statement', 'financial', '/docs/malindi-municipal.pdf', 'application/pdf', 45000, 'Ekurhuleni statement 2025');

-- ── Work Orders ────────────────────────────────────────────────
insert or ignore into work_orders (id, property_id, unit_id, contractor_id, description, status, raised_at, completed_at, cost) values
  ('wo1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', null, null, 'Annual electrical inspection - Oakdale', 'open', '2026-05-01 09:00:00', null, null),
  ('wo1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', null, 'Bathroom tap leaking - Oakdale unit 59', 'in_progress', '2026-05-15 14:30:00', null, null),
  ('wo1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', null, null, 'Garden maintenance - common area', 'completed', '2026-04-20 08:00:00', '2026-04-22 16:00:00', 850),
  ('wo1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', null, null, 'Pool pump repair', 'completed', '2026-03-01 10:00:00', '2026-03-03 15:00:00', 2200),
  ('wo1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', null, null, 'Geyser thermostat replacement - Malindi', 'completed', '2025-03-08 11:00:00', '2025-03-10 14:00:00', 1800),
  ('wo1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', null, null, 'Plumbing inspection - Malindi', 'open', '2026-05-20 09:00:00', null, null),
  ('wo1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000003', null, null, 'Window lock replacement - Indaba', 'open', '2026-05-22 12:00:00', null, null),
  ('wo1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000003', null, null, 'Paint touch-up exterior', 'in_progress', '2026-05-10 08:00:00', null, null),
  ('wo1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000004', null, null, 'Electrical fault - living room socket', 'open', '2026-05-25 16:00:00', null, null),
  ('wo1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000004', null, null, 'Annual fire extinguisher servicing', 'completed', '2026-01-15 09:00:00', '2026-01-15 12:00:00', 650);

-- ── Reconciliation ─────────────────────────────────────────────
insert or ignore into reconciliation (id, property_id, period, rental_amount, bank_amount, status, notes) values
  ('r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '2026-04', 8100, 8100, 'matched', 'April fully reconciled'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '2026-05', 8100, 7950, 'exception', 'R150 variance - bank deposit pending'),
  ('r1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000002', '2026-04', 3700, 3700, 'matched', 'April fully reconciled'),
  ('r1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', '2026-05', 3700, 3500, 'exception', 'R200 variance - awaiting bank statement'),
  ('r1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000003', '2026-04', 4600, 4600, 'matched', 'April fully reconciled'),
  ('r1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000003', '2026-05', 4600, 4600, 'pending', 'May data entry pending'),
  ('r1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000004', '2026-04', 5200, 5200, 'matched', 'April fully reconciled'),
  ('r1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000004', '2026-05', 5200, 5100, 'exception', 'R100 variance - checking Trafalgar deposit');
