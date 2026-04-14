// frontend\src\api\receiveService.js

import { apiClient } from "./apiClient";

export function getReceives() {
  return apiClient.get("/receive");
}

export function createReceive(data) {
  return apiClient.post("/receive", data);
}

export function updateReceiveStatus(id, prevStatus, nextStatus) {
  return apiClient.patch(`/receive/${id}/status`, { prev_status: prevStatus, new_status: nextStatus });
}


export function getReceiveLines(documentId) {
  return apiClient.get(`/receive/${documentId}/lines`);
}

export function preloadLinesFromWarehouse(documentId, warehouseId) {
  return apiClient.post(`/receive/${documentId}/preload-lines`, { warehouse_id: warehouseId });
}

// export async function markLinesForRecount(lineIds) {
//   await apiClient.post("/receive/mark-recount", { line_ids: lineIds });
//   return true;
// }

export function importReceiveLines(documentId, rows) {
  console.log(documentId, rows);
  return apiClient.post(`/receive/${documentId}/lines/import`, rows );
}


export function createRecountDocument(payload) {
  console.log("payload", payload);
  return apiClient.post("/receive/recount", payload);
}