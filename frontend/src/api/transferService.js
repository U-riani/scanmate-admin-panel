import { apiClient } from "./apiClient";

export function getTransfers() {
  return apiClient.get("/transfers");
}

export function createTransfer(data) {
  return apiClient.post("/transfers", data);
}

export function updateTransferStatus(id, prevStatus, nextStatus) {
  return apiClient.patch(`/transfers/${id}/status`, { prev_status: prevStatus, new_status: nextStatus });
}

export function signTransfer(id, userId) {
  return apiClient.patch(`/transfers/${id}/sign`, { user_id: userId });
}
