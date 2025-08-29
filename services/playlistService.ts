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
import { ImageUploadService } from "./imageUploadService";

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

  async likeSong(track: Track): Promise<{ songId: string; likesCount: number }> {
    try {
      const response = await this.apiClient.post<{
        success: boolean;
        message?: string;
        data: {
          songId: string;
          likesCount: number;
        };
      }>(`/songs/${track._id}/like`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to like song");
    } catch (error) {
      console.error("Error liking song:", error);
      throw error;
    }
  }

  async unlikeSong(track: Track): Promise<{ songId: string; likesCount: number }> {
    try {
      const response = await this.apiClient.post<{
        success: boolean;
        message?: string;
        data: {
          songId: string;
          likesCount: number;
        };
      }>(`/songs/${track._id}/unlike`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to unlike song");
    } catch (error) {
      console.error("Error unliking song:", error);
      throw error;
    }
  }

  // Legacy methods - keeping for backward compatibility but now using new endpoints
  async addToLikedSongs(track: Track): Promise<{ songId: string; likesCount: number }> {
    return this.likeSong(track);
  }

  async removeFromLikedSongs(
    track: Track
  ): Promise<{ songId: string; likesCount: number }> {
    return this.unlikeSong(track);
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

  // Helper method to update playlist metadata with thumbnail support
  async updatePlaylist(
    playlistId: string,
    updateData: Partial<CreatePlaylistRequest> & { thumbnailUri?: string }
  ): Promise<{ playlist: PlaylistApiResponse }> {
    try {
      // If thumbnail is a local file, upload it first using multipart/form-data
      if (
        updateData.thumbnailUri &&
        ImageUploadService.isLocalFile(updateData.thumbnailUri)
      ) {
        try {
          const authToken = await storage.getItem(StorageKeys.AUTH_TOKEN);
          if (!authToken) {
            throw new Error("No auth token found");
          }

          // Create FormData for multipart upload
          const formData = new FormData();

          // Add other fields
          if (updateData.name) formData.append("name", updateData.name);
          if (updateData.description)
            formData.append("description", updateData.description);

          // Add thumbnail file
          const fileInfo = {
            uri: updateData.thumbnailUri,
            type: "image/jpeg",
            name: `playlist_thumbnail_${Date.now()}.jpg`,
          };
          formData.append("thumbnail", fileInfo as any);

          // Use fetch for multipart upload
          const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
            method: "PUT",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            return { playlist: data.data.playlist };
          } else {
            throw new Error(data.message || "Failed to update playlist");
          }
        } catch (uploadError) {
          console.error("Error uploading playlist thumbnail:", uploadError);
          throw uploadError;
        }
      } else {
        // Regular update without thumbnail upload
        const { thumbnailUri, ...restData } = updateData;
        const response = await this.apiClient.put<GetPlaylistResponse>(
          `/playlists/${playlistId}`,
          restData
        );

        if (response.data.success) {
          return { playlist: response.data.data.playlist };
        }

        throw new Error(response.data.message || "Failed to update playlist");
      }
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
