import { apiClient } from "./apiClient";
import { mapPriceRow } from "./mappers";

export function getPriceUploads() {
  return apiClient.get("/price-uploads");
}

export function getPriceUploadById(uploadId) {
  return apiClient.get(`/price-uploads/${uploadId}`);
}

export async function getPriceRowsByUploadId(uploadId) {
  const rows = await apiClient.get(`/price-uploads/${uploadId}/rows`);
  return rows.map(mapPriceRow);
}

export function getActivePriceUploadByWarehouse(warehouseId) {
  return apiClient.get(`/price-uploads/active/${warehouseId}`);
}

export async function createPriceUpload(data) {
  const response = await apiClient.post("/price-uploads", data);
  return response.upload;
}

export function setActivePriceUpload(uploadId) {
  return apiClient.post(`/price-uploads/${uploadId}/activate`, {});
}

export function archivePriceUpload(uploadId) {
  return apiClient.post(`/price-uploads/${uploadId}/archive`, {});
}

export async function addPriceRows({ upload_id, rows }) {
  const response = await apiClient.post(`/price-uploads/${upload_id}/rows`, { rows });
  return response;
}
