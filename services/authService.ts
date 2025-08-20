import { storage, StorageKeys } from "@/utils/storage";
import axios from "axios";

const API_BASE_URL = "https://nodejs-music-app-backend.vercel.app/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(StorageKeys.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = await storage.getItem(StorageKeys.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // Update to match backend response format
          const newToken = response.data.success
            ? response.data.data.token
            : response.data.token;
          await storage.setItem(StorageKeys.AUTH_TOKEN, newToken);

          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios.request(error.config);
        }
      } catch (refreshError) {
        await storage.removeItem(StorageKeys.AUTH_TOKEN);
        await storage.removeItem(StorageKeys.REFRESH_TOKEN);
        await storage.removeItem(StorageKeys.USER_DATA);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
