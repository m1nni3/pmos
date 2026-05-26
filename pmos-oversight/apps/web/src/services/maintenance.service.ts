import { supabase } from "../lib/supabase";

export async function getWorkOrders(propertyId?: string) {
  let query = supabase.from("work_orders").select("*");
  if (propertyId) query = query.eq("property_id", propertyId);
  const { data } = await query;
  return data ?? [];
}

export async function createWorkOrder(workOrder: Record<string, unknown>) {
  const { data } = await supabase.from("work_orders").insert(workOrder).select().single();
  return data;
}
