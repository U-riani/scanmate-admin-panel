import { apiClient } from "./apiClient";

export function getPocketUsers() {
  return apiClient.get("/pocket-users");
}

export function createPocketUser(user) {
  return apiClient.post("/pocket-users", user);
}

export function updatePocketUser(id, data) {
  return apiClient.put(`/pocket-users/${id}`, data);
}

export async function deletePocketUser(id) {
  await apiClient.delete(`/pocket-users/${id}`);
  return true;
}

export async function resetPocketUserPassword(id, password) {
  await apiClient.post(`/pocket-users/${id}/reset-password`, { password });
  return true;
}
