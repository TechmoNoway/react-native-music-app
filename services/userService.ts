import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import type { UserProfileResponse } from "@/types/api";
import { storage, StorageKeys } from "@/utils/storage";
import axios, { isAxiosError } from "axios";

export class UserService {
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

  static async getUserProfile() {
    try {
      const headers = await this.getAuthHeaders();

      const response = await axios.get<UserProfileResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER.PROFILE}`,
        {
          headers,
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Failed to get user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Token expired or invalid, need to logout
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
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Authentication expired");
        }
        throw new Error(error.response?.data?.message || "Failed to update profile");
      }

      throw error;
    }
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
