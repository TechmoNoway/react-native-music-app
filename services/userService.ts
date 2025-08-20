import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import type { UserProfileResponse } from "@/types/api";
import { storage, StorageKeys } from "@/utils/storage";
import axios, { isAxiosError } from "axios";

export class UserService {
  private static profileCache: any = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 200 * 60 * 1000; // 200 minutes

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
          console.log("Returning cached profile data");
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

      const response = await axios.put<UserProfileResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER.UPDATE_PROFILE}`,
        userData,
        {
          headers,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success && response.data.data) {
        // Cache the result and clear previous cache
        this.profileCache = response.data.data.user;
        this.cacheTimestamp = Date.now();
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Clear cache on auth error
          this.profileCache = null;
          this.cacheTimestamp = 0;
          throw new Error("Authentication expired");
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
