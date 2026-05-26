CREATE TABLE managing_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE letting_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  rates_payable NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  branch_code TEXT,
  account_number TEXT NOT NULL,
  account_type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT
);

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  insurance_expiry DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
