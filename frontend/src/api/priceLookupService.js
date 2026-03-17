import { apiClient } from "./apiClient";

export function lookupBarcodePrice(warehouseId, barcode) {
  const params = new URLSearchParams({
    warehouse_id: String(warehouseId),
    barcode: String(barcode),
  });

  return apiClient.get(`/price-uploads/lookup/by-barcode?${params.toString()}`);
}
