import { apiClient } from "./apiClient";

export function getInventorizations() {
  return apiClient.get("/inventorization");
}

export function createInventorization(data) {
  return apiClient.post("/inventorization", data);
}

export function updateInventorizationStatus(id, prevStatus, nextStatus) {
  return apiClient.patch(`/inventorization/${id}/status`, {  prev_status: prevStatus, new_status: nextStatus  });
}
