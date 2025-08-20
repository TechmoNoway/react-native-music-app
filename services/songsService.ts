import { SearchSongsResponse, SongsApiResponse } from "@/types/api";
import { Track } from "@/types/audio";
import { storage, StorageKeys } from "@/utils/storage";
import axios from "axios";

const API_BASE_URL = "https://nodejs-music-app-backend.vercel.app/api";

class SongsService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add auth token to requests
    this.apiClient.interceptors.request.use(async (config) => {
      try {
        const token = await storage.getItem(StorageKeys.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Silent error handling for auth token
      }
      return config;
    });

    // Handle response errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Get all songs
  async getAllSongs(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ tracks: Track[]; pagination?: any }> {
    try {
      const response = await this.apiClient.get<SongsApiResponse>("/songs", {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          genre: params?.genre,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc",
        },
      });

      if (response.data.success) {
        const songs = response.data.data.songs; // Based on backend response structure

        return {
          tracks: songs, // Return as tracks for consistency
          pagination: response.data.pagination,
        };
      }

      throw new Error(response.data.message || "Failed to fetch songs");
    } catch (error) {
      console.error("Error fetching songs:", error);
      throw error;
    }
  }

  // Search songs
  async searchSongs(
    query: string,
    params?: {
      page?: number;
      limit?: number;
      genre?: string;
    }
  ): Promise<{ tracks: Track[]; total: number }> {
    try {
      const response = await this.apiClient.get<SearchSongsResponse>("/songs/search", {
        params: {
          q: query,
          page: params?.page || 1,
          limit: params?.limit || 20,
          genre: params?.genre,
        },
      });

      if (response.data.success) {
        const songs = response.data.data.songs; // Based on backend response structure

        return {
          tracks: songs, // Return as tracks for consistency
          total: response.data.data.total || songs.length,
        };
      }

      throw new Error(response.data.message || "Search failed");
    } catch (error) {
      console.error("Error searching songs:", error);
      throw error;
    }
  }

  // Get songs by genre
  async getSongsByGenre(
    genre: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ tracks: Track[] }> {
    try {
      return await this.getAllSongs({
        ...params,
        genre,
      });
    } catch (error) {
      console.error(`Error fetching ${genre} songs:`, error);
      throw error;
    }
  }

  // Get popular songs
  async getPopularSongs(limit: number = 20): Promise<{ tracks: Track[] }> {
    try {
      return await this.getAllSongs({
        limit,
        sortBy: "playCount",
        sortOrder: "desc",
      });
    } catch (error) {
      console.error("Error fetching popular songs:", error);
      throw error;
    }
  }

  // Get song by ID
  async getSongById(id: string): Promise<{ track: Track }> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: Track }>(
        `/songs/${id}`
      );

      if (response.data.success) {
        const track = response.data.data;

        return { track };
      }

      throw new Error("Song not found");
    } catch (error) {
      console.error("Error fetching song:", error);
      throw error;
    }
  }

  // Update play count
  async updatePlayCount(id: string): Promise<void> {
    try {
      await this.apiClient.post(`/songs/${id}/play`);
    } catch (error) {
      console.log("Error updating play count:", error);
      // Don't throw error for play count update
    }
  }
}

export const songsService = new SongsService();
export default songsService;
