import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { lookupBarcodePrice } from "../api/priceLookupService";

export function usePriceLookup(warehouseId, barcode) {
  return useQuery({
    queryKey: QUERY_KEYS.priceLookup(warehouseId, barcode),
    queryFn: () => lookupBarcodePrice(warehouseId, barcode),
    enabled: !!warehouseId && !!barcode,
  });
}
