// frontend\src\api\inventorizationRecountService.js
import { apiClient } from "./apiClient";

export function createRecountDocument(payload) {
  console.log("payload", payload);
  return apiClient.post("/inventorization/recount", payload);
}
