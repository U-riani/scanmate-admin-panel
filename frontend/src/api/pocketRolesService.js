import { apiClient } from "./apiClient";

export function getPocketRoles() {
  return apiClient.get("/pocket-roles");
}

export function createPocketRole(role) {
  return apiClient.post("/pocket-roles", role);
}

export function updatePocketRole(roleId, data) {
  return apiClient.put(`/pocket-roles/${roleId}`, data);
}

export async function deletePocketRole(roleId) {
  await apiClient.delete(`/pocket-roles/${roleId}`);
  return true;
}
