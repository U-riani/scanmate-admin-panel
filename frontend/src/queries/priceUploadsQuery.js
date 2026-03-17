import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getActivePriceUploadByWarehouse, getPriceRowsByUploadId, getPriceUploadById, getPriceUploads } from "../api/priceUploadService";

export function usePriceUploads() {
  return useQuery({
    queryKey: QUERY_KEYS.priceUploads,
    queryFn: getPriceUploads,
  });
}

export function usePriceUpload(uploadId) {
  return useQuery({
    queryKey: QUERY_KEYS.priceUpload(uploadId),
    queryFn: () => getPriceUploadById(uploadId),
    enabled: !!uploadId,
  });
}

export function usePriceRows(uploadId) {
  return useQuery({
    queryKey: QUERY_KEYS.priceRows(uploadId),
    queryFn: () => getPriceRowsByUploadId(uploadId),
    enabled: !!uploadId,
  });
}

export function useActivePriceUpload(warehouseId) {
  return useQuery({
    queryKey: QUERY_KEYS.activePriceUpload(warehouseId),
    queryFn: () => getActivePriceUploadByWarehouse(warehouseId),
    enabled: !!warehouseId,
  });
}
