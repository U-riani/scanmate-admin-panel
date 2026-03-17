import { apiClient } from "./apiClient";

export function getInventorizationLines(documentId) {
  return apiClient.get(`/inventorization/${documentId}/lines`);
}

export function preloadLinesFromWarehouse(documentId, warehouseId) {
  return apiClient.post(`/inventorization/${documentId}/preload-lines`, { warehouse_id: warehouseId });
}

export async function markLinesForRecount(lineIds) {
  await apiClient.post("/inventorization/mark-recount", { line_ids: lineIds });
  return true;
}

export function importInventorizationLines(documentId, rows) {
  return apiClient.post(`/inventorization/${documentId}/import-lines`, { rows });
}
