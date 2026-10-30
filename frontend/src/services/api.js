import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://addis-traffic-predictor-thrumming-ridge-2630.fly.dev/";

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
