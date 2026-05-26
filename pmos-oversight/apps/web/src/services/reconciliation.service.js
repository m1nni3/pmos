import { supabase } from "../lib/supabase";
export async function getExceptions() {
    const { data } = await supabase.from("reconciliation_exceptions").select("*");
    return data ?? [];
}
export async function verifyTransaction(id) {
    const { data } = await supabase.rpc("verify_transaction", { transaction_id: id });
    return data;
}
