import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

export async function predictTraffic(payload) {
  const { data } = await api.post("/predict", payload);
  return data;
}

export default api;
