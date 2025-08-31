import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import { storage } from "@/utils/storage";

export class FavoriteService {
  private static async getAuthHeaders() {
    const token = await storage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  static async likeSong(songId: string) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SONGS.LIKE(songId)}`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to like song");
      }

      return data;
    } catch (error: any) {
      console.error("❌ Error liking song:", error);
      throw error;
    }
  }

  static async unlikeSong(songId: string) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SONGS.UNLIKE(songId)}`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unlike song");
      }

      return data;
    } catch (error: any) {
      console.error("❌ Error unliking song:", error);
      throw error;
    }
  }

  // Check if a song is liked (có thể cache hoặc check từ user profile)
  static async isLiked(songId: string): Promise<boolean> {
    // Tạm thời return false, bạn có thể implement logic check từ user profile
    // hoặc từ API endpoint khác nếu có
    return false;
  }
}
