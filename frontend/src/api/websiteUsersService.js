import { apiClient } from "./apiClient";

export function getWebsiteUsers() {
  return apiClient.get("/website-users");
}

export function createWebsiteUser(user) {
  return apiClient.post("/website-users", user);
}

export function updateWebsiteUser(id, data) {
  return apiClient.put(`/website-users/${id}`, data);
}

export async function deleteWebsiteUser(id) {
  await apiClient.delete(`/website-users/${id}`);
  return true;
}

export async function resetWebsiteUserPassword(id, password) {
  await apiClient.post(`/website-users/${id}/reset-password`, { password });
  return true;
}
