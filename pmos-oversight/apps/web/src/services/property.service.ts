import { supabase } from "../lib/supabase";

export async function getProperties() {
  const { data } = await supabase.from("properties").select("*");
  return data ?? [];
}

export async function getProperty(id: string) {
  const { data } = await supabase.from("properties").select("*").eq("id", id).single();
  return data;
}

export async function getUnits(propertyId: string) {
  const { data } = await supabase.from("units").select("*").eq("property_id", propertyId);
  return data ?? [];
}
