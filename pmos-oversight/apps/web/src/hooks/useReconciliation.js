import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExceptions, verifyTransaction } from "../services/reconciliation.service";
export function useExceptions() {
    return useQuery({
        queryKey: ["reconciliation_exceptions"],
        queryFn: getExceptions,
    });
}
export function useVerifyTransaction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: verifyTransaction,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["reconciliation_exceptions"] });
        },
    });
}
