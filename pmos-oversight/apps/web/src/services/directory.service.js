import { supabase } from "../lib/supabase";
export async function getManagingAgents() {
    const { data } = await supabase.from("managing_agents").select("*");
    return data ?? [];
}
export async function getLettingAgents() {
    const { data } = await supabase.from("letting_agents").select("*");
    return data ?? [];
}
export async function getMunicipalities() {
    const { data } = await supabase.from("municipalities").select("*");
    return data ?? [];
}
export async function getBanks() {
    const { data } = await supabase.from("banks").select("*");
    return data ?? [];
}
export async function getContractors() {
    const { data } = await supabase.from("contractors").select("*");
    return data ?? [];
}
