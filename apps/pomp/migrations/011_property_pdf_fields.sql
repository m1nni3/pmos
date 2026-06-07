-- Migration 011: Add missing property_details fields for PDF portfolio data
-- Includes: valuation date, bond endorsement details, lease expiry, managing agency

alter table property_details add column valuation_date text;
alter table property_details add column bond_endorsement real;
alter table property_details add column bond_endorsement_date text;
alter table property_details add column bond_status text;
alter table property_details add column lease_expiry text;
alter table property_details add column managing_agency text;
