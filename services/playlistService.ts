import {
  AddSongToPlaylistRequest,
  CreatePlaylistRequest,
  GetPlaylistResponse,
  GetPlaylistsResponse,
  PlaylistApiResponse,
} from "@/types/api";
import { Track } from "@/types/audio";
import { storage, StorageKeys } from "@/utils/storage";
import axios from "axios";

const API_BASE_URL = "https://nodejs-music-app-backend.vercel.app/api";

class PlaylistService {
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
      } catch (error) {
        console.log("Error getting auth token:", error);
      }
      return config;
    });

    // Handle response errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const refreshToken = await storage.getItem(StorageKeys.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const newToken = response.data.success
                ? response.data.data.token
                : response.data.token;
              await storage.setItem(StorageKeys.AUTH_TOKEN, newToken);

              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios.request(error.config);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Clear stored tokens
            await storage.removeItem(StorageKeys.AUTH_TOKEN);
            await storage.removeItem(StorageKeys.REFRESH_TOKEN);
            await storage.removeItem(StorageKeys.USER_DATA);
          }
        }
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Get user's playlists with optional filters
  async getUserPlaylists(filters?: {
    type?: string;
    search?: string;
  }): Promise<{ playlists: PlaylistApiResponse[]; total: number }> {
    try {
      const response = await this.apiClient.get<GetPlaylistsResponse>("/playlists", {
        params: filters,
      });

      if (response.data.success) {
        return {
          playlists: response.data.data.playlists,
          total: response.data.data.total,
        };
      }

      throw new Error(response.data.message || "Failed to fetch playlists");
    } catch (error) {
      console.error("Error fetching playlists:", error);
      throw error;
    }
  }

  // Get playlist by ID
  async getPlaylistById(playlistId: string): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      const response = await this.apiClient.get<GetPlaylistResponse>(
        `/playlists/${playlistId}`
      );

      if (response.data.success) {
        return { playlist: response.data.data.playlist };
      }

      throw new Error(response.data.message || "Playlist not found");
    } catch (error) {
      console.error("Error fetching playlist:", error);
      throw error;
    }
  }

  // Create a new custom playlist
  async createPlaylist(
    playlistData: CreatePlaylistRequest
  ): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      const response = await this.apiClient.post<GetPlaylistResponse>(
        "/playlists",
        playlistData
      );

      if (response.data.success) {
        return { playlist: response.data.data.playlist };
      }

      throw new Error(response.data.message || "Failed to create playlist");
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw error;
    }
  }

  // Add song to playlist (including liked songs)
  async addSongToPlaylist(
    playlistId: string,
    songData: AddSongToPlaylistRequest
  ): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      const response = await this.apiClient.post<GetPlaylistResponse>(
        `/playlists/${playlistId}/songs`,
        songData
      );

      if (response.data.success) {
        return { playlist: response.data.data.playlist };
      }

      throw new Error(response.data.message || "Failed to add song to playlist");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      throw error;
    }
  }

  // Helper method to add song to liked songs (will find or create liked songs playlist)
  async addToLikedSongs(track: Track): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      // First, get user's playlists to find the liked songs playlist
      const { playlists } = await this.getUserPlaylists({ type: "liked" });

      let likedPlaylist = playlists.find((p) => p.playlistType === "liked");

      if (!likedPlaylist) {
        throw new Error("Liked songs playlist not found");
      }

      return await this.addSongToPlaylist(likedPlaylist._id, { songId: track._id });
    } catch (error) {
      console.error("Error adding to liked songs:", error);
      throw error;
    }
  }

  // Helper method to remove song from playlist (if backend supports it)
  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      const response = await this.apiClient.delete<GetPlaylistResponse>(
        `/playlists/${playlistId}/songs/${songId}`
      );

      if (response.data.success) {
        return { playlist: response.data.data.playlist };
      }

      throw new Error(response.data.message || "Failed to remove song from playlist");
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      throw error;
    }
  }

  // Helper method to update playlist metadata
  async updatePlaylist(
    playlistId: string,
    updateData: Partial<CreatePlaylistRequest>
  ): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      const response = await this.apiClient.put<GetPlaylistResponse>(
        `/playlists/${playlistId}`,
        updateData
      );

      if (response.data.success) {
        return { playlist: response.data.data.playlist };
      }

      throw new Error(response.data.message || "Failed to update playlist");
    } catch (error) {
      console.error("Error updating playlist:", error);
      throw error;
    }
  }

  // Helper method to delete playlist
  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      const response = await this.apiClient.delete<{
        success: boolean;
        message?: string;
      }>(`/playlists/${playlistId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete playlist");
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      throw error;
    }
  }
}

export const playlistService = new PlaylistService();
export default playlistService;
