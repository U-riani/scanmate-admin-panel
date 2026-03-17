import { apiClient } from "./apiClient";

export async function authenticate(email, password) {
  const response = await apiClient.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return {
    token: response.access_token,
    user: response.user,
  };
}
