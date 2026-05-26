import { supabase } from "../lib/supabase";

export async function getRentalLedger(propertyId?: string) {
  let query = supabase.from("rental_ledger").select("*");
  if (propertyId) query = query.eq("property_id", propertyId);
  const { data } = await query;
  return data ?? [];
}

export async function getLevyLedger(propertyId?: string) {
  let query = supabase.from("levy_ledger").select("*");
  if (propertyId) query = query.eq("property_id", propertyId);
  const { data } = await query;
  return data ?? [];
}

export async function getMunicipalityLedger(propertyId?: string) {
  let query = supabase.from("municipality_ledger").select("*");
  if (propertyId) query = query.eq("property_id", propertyId);
  const { data } = await query;
  return data ?? [];
}

export async function getBankLedger(accountId?: string) {
  let query = supabase.from("bank_ledger").select("*");
  if (accountId) query = query.eq("account_id", accountId);
  const { data } = await query;
  return data ?? [];
}
