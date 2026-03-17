import { apiClient } from "./apiClient";

export function getWebsiteRoles() {
  return apiClient.get("/website-roles");
}

export function createWebsiteRole(role) {
  return apiClient.post("/website-roles", role);
}

export function updateWebsiteRole(roleId, data) {
  return apiClient.put(`/website-roles/${roleId}`, data);
}

export async function deleteWebsiteRole(roleId) {
  await apiClient.delete(`/website-roles/${roleId}`);
  return true;
}
