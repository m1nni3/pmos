import { useQuery } from "@tanstack/react-query";
import { getProperties } from "../services/property.service";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: getProperties,
  });
}
