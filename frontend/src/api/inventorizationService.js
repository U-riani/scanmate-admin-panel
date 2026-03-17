import { apiClient } from "./apiClient";

export function getInventorizations() {
  return apiClient.get("/inventorization");
}

export function createInventorization(data) {
  return apiClient.post("/inventorization", data);
}

export function updateInventorizationStatus(id, status) {
  return apiClient.patch(`/inventorization/${id}/status`, { status });
}
