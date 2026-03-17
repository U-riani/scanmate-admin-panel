import { apiClient } from "./apiClient";

export function createRecountDocument(payload) {
  return apiClient.post("/inventorization/recount", payload);
}
