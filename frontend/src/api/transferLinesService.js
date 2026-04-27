// frontend\src\api\transferLinesService.js
import { apiClient } from "./apiClient";

export function getTransferLines(documentId) {
  return apiClient.get(`/transfers/${documentId}/lines`);
}

export function addTransferLines(documentId, rows) {
  return apiClient.post(`/transfers/${documentId}/lines`, rows);
}

export function importTransferLines(docId, rows) {
  return apiClient.post(`/transfers/${docId}/import-lines`, rows);
}

export function updateSenderScan(lineId, qty, userId) {
  return apiClient.put(`/transfers/lines/${lineId}`, {
    sent_qty: qty,
    sender_user_id: userId,
  });
}

export function updateReceiverScan(lineId, qty, userId) {
  return apiClient.put(`/transfers/lines/${lineId}`, {
    received_qty: qty,
    receiver_user_id: userId,
  });
}

export function updateTransferLine(lineId, data) {
  return apiClient.put(`/transfers/lines/${lineId}`, data);
}

export async function deleteTransferLine(lineId) {
  await apiClient.delete(`/transfers/lines/${lineId}`);
  return true;
}

export function updateTransferLineQuantity(lineId, payload) {
  return apiClient.patch(`/transfers/lines/${lineId}/quantity`, payload);
}