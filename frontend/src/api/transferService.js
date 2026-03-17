import { apiClient } from "./apiClient";

export function getTransfers() {
  return apiClient.get("/transfers");
}

export function createTransfer(data) {
  return apiClient.post("/transfers", data);
}

export function updateTransferStatus(id, status) {
  return apiClient.patch(`/transfers/${id}/status`, { status });
}

export function signTransfer(id, userId) {
  return apiClient.patch(`/transfers/${id}/sign`, { user_id: userId });
}
