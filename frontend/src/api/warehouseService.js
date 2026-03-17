import { apiClient } from "./apiClient";

export function getWarehouses() {
  return apiClient.get("/warehouses");
}

export function createWarehouse(data) {
  return apiClient.post("/warehouses", data);
}

export function updateWarehouse(id, data) {
  return apiClient.put(`/warehouses/${id}`, data);
}

export async function deleteWarehouse(id) {
  await apiClient.delete(`/warehouses/${id}`);
  return true;
}
