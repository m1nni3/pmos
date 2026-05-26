import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkOrders, createWorkOrder } from "../services/maintenance.service";

export function useWorkOrders(propertyId?: string) {
  return useQuery({
    queryKey: ["work_orders", propertyId],
    queryFn: () => getWorkOrders(propertyId),
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work_orders"] });
    },
  });
}
