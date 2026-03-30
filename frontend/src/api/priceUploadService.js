import { apiClient } from "./apiClient";
import { mapPriceRow } from "./mappers";

export function getPriceUploads() {
  return apiClient.get("/price");
}

export function getPriceUploadById(uploadId) {
  return apiClient.get(`/price/${uploadId}/lines`);
}

export async function getPriceRowsByUploadId(uploadId) {
  const lines = await apiClient.get(`/price/${uploadId}/lines`);
  return lines.map(mapPriceRow);
}

export function getActivePriceUploadByWarehouse(warehouseId) {
  return apiClient.get(`/price/active/${warehouseId}`);
}

export async function createPriceUpload(data) {
  const response = await apiClient.post("/price", data);
  return response.upload;
}

export function setActivePriceUpload(uploadId) {
  return apiClient.post(`/price/${uploadId}/activate`, {});
}

export function archivePriceUpload(uploadId) {
  return apiClient.post(`/price/${uploadId}/archive`, {});
}

export async function addPriceRows({ upload_id, rows }) {
  const response = await apiClient.post(`/price/${upload_id}/rows`, { rows });
  return response;
}
