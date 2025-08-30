import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import type { UserProfileResponse } from "@/types/api";
import { storage, StorageKeys } from "@/utils/storage";
import axios, { isAxiosError } from "axios";

export class UserService {
  private static profileCache: any = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 200 * 60 * 1000;

  private static async getAuthHeaders() {
    try {
      const token = await storage.getItem(StorageKeys.AUTH_TOKEN);
      if (!token) {
        throw new Error("No auth token found");
      }
      return {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      throw error;
    }
  }

  static async getUserProfile(forceRefresh: boolean = false) {
    try {
      if (!forceRefresh && this.profileCache && this.cacheTimestamp) {
        const now = Date.now();
        if (now - this.cacheTimestamp < this.CACHE_DURATION) {
          return this.profileCache;
        }
      }

      const headers = await this.getAuthHeaders();

      const response = await axios.get<UserProfileResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER.PROFILE}`,
        {
          headers,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success && response.data.data) {
        this.profileCache = response.data.data.user;
        this.cacheTimestamp = Date.now();
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Failed to get user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          this.clearCache();
          throw new Error("Authentication expired");
        }
        throw new Error(error.response?.data?.message || "Failed to fetch user profile");
      }

      throw error;
    }
  }

  static async updateUserProfile(userData: {
    username?: string;
    email?: string;
    avatar?: string;
  }) {
    try {
      const headers = await this.getAuthHeaders();

      const isLocalFile = userData.avatar && userData.avatar.startsWith("file://");

      if (isLocalFile) {
        try {
          const authToken = await storage.getItem(StorageKeys.AUTH_TOKEN);
          if (!authToken) {
            throw new Error("No auth token found");
          }

          const formData = new FormData();

          if (userData.username) {
            formData.append("username", userData.username);
          }
          if (userData.email) {
            formData.append("email", userData.email);
          }

          if (userData.avatar) {
            const fileName = userData.avatar.split("/").pop() || "avatar.jpg";
            const fileType = fileName.split(".").pop()?.toLowerCase() || "jpg";

            const fileInfo = {
              uri: userData.avatar,
              type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
              name: fileName,
            };
            formData.append("avatar", fileInfo as any);
          }

          const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`,
            {
              method: "PUT",
              body: formData,
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();

          if (data.success && data.data) {
            this.clearCache();
            this.profileCache = data.data.user;
            this.cacheTimestamp = Date.now();
            return data.data.user;
          } else {
            throw new Error(data.message || "Failed to update profile");
          }
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          throw uploadError;
        }
      } else {
        const response = await axios.put<UserProfileResponse>(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`,
          userData,
          {
            headers,
            timeout: API_CONFIG.TIMEOUT,
          }
        );

        if (response.data.success && response.data.data) {
          this.clearCache();
          this.profileCache = response.data.data.user;
          this.cacheTimestamp = Date.now();
          return response.data.data.user;
        } else {
          throw new Error(response.data.message || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (isAxiosError(error)) {
        console.error("Axios error details:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });

        if (error.response?.status === 401) {
          // Clear cache on auth error
          this.profileCache = null;
          this.cacheTimestamp = 0;
          throw new Error("Authentication expired");
        }

        if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
          throw new Error(
            "Network connection failed. Please check your internet connection."
          );
        }

        throw new Error(error.response?.data?.message || "Failed to update profile");
      }

      throw error;
    }
  }

  static clearCache() {
    this.profileCache = null;
    this.cacheTimestamp = 0;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/user/password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication expired");
        }
        throw new Error(error.response?.data?.message || "Failed to change password");
      }

      throw error;
    }
  }
}
