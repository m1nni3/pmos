import { useQuery } from "@tanstack/react-query";
import { getRentalLedger, getLevyLedger, getMunicipalityLedger, getBankLedger } from "../services/finance.service";
export function useRentalLedger(propertyId) {
    return useQuery({
        queryKey: ["rental_ledger", propertyId],
        queryFn: () => getRentalLedger(propertyId),
    });
}
export function useLevyLedger(propertyId) {
    return useQuery({
        queryKey: ["levy_ledger", propertyId],
        queryFn: () => getLevyLedger(propertyId),
    });
}
export function useMunicipalityLedger(propertyId) {
    return useQuery({
        queryKey: ["municipality_ledger", propertyId],
        queryFn: () => getMunicipalityLedger(propertyId),
    });
}
export function useBankLedger(accountId) {
    return useQuery({
        queryKey: ["bank_ledger", accountId],
        queryFn: () => getBankLedger(accountId),
    });
}
