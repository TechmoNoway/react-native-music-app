import { PlaylistMetadata, TrackWithPlaylist } from "@/helpers/types";
import { playlistService } from "@/services/playlistService";
import { PlaylistApiResponse } from "@/types/api";
import { Track } from "@/types/audio";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const fetchUserPlaylists = createAsyncThunk(
  "library/fetchUserPlaylists",
  async (filters?: { type?: string; search?: string }) => {
    const response = await playlistService.getUserPlaylists(filters);
    return response;
  }
);

export const createPlaylistAsync = createAsyncThunk(
  "library/createPlaylist",
  async (playlistData: {
    name: string;
    description?: string;
    coverImageUrl?: string;
  }) => {
    const response = await playlistService.createPlaylist(playlistData);
    return response.playlist;
  }
);

export const addSongToPlaylistAsync = createAsyncThunk(
  "library/addSongToPlaylist",
  async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    const response = await playlistService.addSongToPlaylist(playlistId, { songId });
    return response.playlist;
  }
);

export const toggleTrackFavoriteAsync = createAsyncThunk(
  "library/toggleTrackFavorite",
  async (track: Track) => {
    const response = await playlistService.addToLikedSongs(track);
    return { track, likeData: response };
  }
);

export const updatePlaylistAsync = createAsyncThunk(
  "library/updatePlaylist",
  async ({
    playlistId,
    updateData,
  }: {
    playlistId: string;
    updateData: { name?: string; description?: string; coverImageUrl?: string };
  }) => {
    const response = await playlistService.updatePlaylist(playlistId, updateData);
    return response.playlist;
  }
);

export const deletePlaylistAsync = createAsyncThunk(
  "library/deletePlaylist",
  async (playlistId: string) => {
    await playlistService.deletePlaylist(playlistId);
    return playlistId;
  }
);

export const removeSongFromPlaylistAsync = createAsyncThunk(
  "library/removeSongFromPlaylist",
  async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    const response = await playlistService.removeSongFromPlaylist(playlistId, songId);
    return response.playlist;
  }
);

interface LibraryState {
  tracks: TrackWithPlaylist[];
  playlistsMetadata: PlaylistMetadata[];
  apiPlaylists: PlaylistApiResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  tracks: [],
  playlistsMetadata: [
    {
      name: "Liked Songs",
      isDefault: true,
    },
  ],
  apiPlaylists: [],
  loading: false,
  error: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    toggleTrackFavorite: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      const trackIndex = state.tracks.findIndex(
        (currentTrack) => currentTrack._id === track._id
      );

      if (trackIndex !== -1) {
        const currentPlaylists = state.tracks[trackIndex].playlist ?? [];
        const isLiked = currentPlaylists.includes("Liked Songs");

        if (isLiked) {
          state.tracks[trackIndex].playlist = currentPlaylists.filter(
            (playlist) => playlist !== "Liked Songs"
          );
          state.tracks[trackIndex].rating = 0;
        } else {
          state.tracks[trackIndex].playlist = [...currentPlaylists, "Liked Songs"];
          state.tracks[trackIndex].rating = 1;
        }
      }
    },
    addToPlaylist: (
      state,
      action: PayloadAction<{ track: Track; playlistName: string }>
    ) => {
      const { track, playlistName } = action.payload;
      const trackIndex = state.tracks.findIndex(
        (currentTrack) => currentTrack._id === track._id
      );

      if (trackIndex !== -1) {
        const currentPlaylists = state.tracks[trackIndex].playlist ?? [];
        if (!currentPlaylists.includes(playlistName)) {
          state.tracks[trackIndex].playlist = [...currentPlaylists, playlistName];
        }
      }
    },
    createPlaylist: (
      state,
      action: PayloadAction<{
        name: string;
        customImage?: string;
        description?: string;
      }>
    ) => {
      const { name, customImage, description } = action.payload;

      const existingPlaylist = state.playlistsMetadata.find(
        (playlist) => playlist.name.toLowerCase() === name.toLowerCase()
      );

      if (!existingPlaylist) {
        state.playlistsMetadata.push({
          name,
          customImage,
          description,
          isDefault: false,
        });
      }
    },
    deletePlaylist: (state, action: PayloadAction<string>) => {
      const playlistName = action.payload;

      const playlist = state.playlistsMetadata.find((p) => p.name === playlistName);
      if (playlist && !playlist.isDefault) {
        state.playlistsMetadata = state.playlistsMetadata.filter(
          (p) => p.name !== playlistName
        );

        state.tracks.forEach((track) => {
          if (track.playlist) {
            track.playlist = track.playlist.filter((p) => p !== playlistName);
          }
        });
      }
    },
    renamePlaylist: (
      state,
      action: PayloadAction<{ oldName: string; newName: string }>
    ) => {
      const { oldName, newName } = action.payload;

      const playlist = state.playlistsMetadata.find((p) => p.name === oldName);
      if (playlist && !playlist.isDefault) {
        playlist.name = newName;

        state.tracks.forEach((track) => {
          if (track.playlist) {
            const index = track.playlist.indexOf(oldName);
            if (index !== -1) {
              track.playlist[index] = newName;
            }
          }
        });
      }
    },
    updatePlaylistImage: (
      state,
      action: PayloadAction<{ name: string; customImage: string }>
    ) => {
      const { name, customImage } = action.payload;

      const playlist = state.playlistsMetadata.find((p) => p.name === name);
      if (playlist && !playlist.isDefault) {
        playlist.customImage = customImage;
      }
    },
    updatePlaylistDescription: (
      state,
      action: PayloadAction<{ name: string; description: string }>
    ) => {
      const { name, description } = action.payload;

      const playlist = state.playlistsMetadata.find((p) => p.name === name);
      if (playlist) {
        playlist.description = description;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.apiPlaylists = action.payload.playlists;

        const apiPlaylistsMetadata: PlaylistMetadata[] = action.payload.playlists.map(
          (p) => ({
            name: p.name,
            customImage: p.coverImageUrl,
            description: p.description,
            isDefault: p.isDefault,
          })
        );

        state.playlistsMetadata = apiPlaylistsMetadata;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch playlists";
      });

    builder
      .addCase(createPlaylistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlaylistAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Add the new playlist to the API playlists array
        state.apiPlaylists.push(action.payload);

        // Add to local metadata
        state.playlistsMetadata.push({
          name: action.payload.name,
          customImage: action.payload.coverImageUrl,
          description: action.payload.description,
          isDefault: action.payload.isDefault,
        });
      })
      .addCase(createPlaylistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create playlist";
      });

    // Add song to playlist
    builder
      .addCase(addSongToPlaylistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSongToPlaylistAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Update the playlist in apiPlaylists
        const playlistIndex = state.apiPlaylists.findIndex(
          (p) => p._id === action.payload._id
        );
        if (playlistIndex !== -1) {
          state.apiPlaylists[playlistIndex] = action.payload;
        }
      })
      .addCase(addSongToPlaylistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add song to playlist";
      });

    // Toggle track favorite
    builder
      .addCase(toggleTrackFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTrackFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Note: API response only contains like count, not full playlist
        // We'll rely on fetching playlists separately for full sync

        // Update local tracks state for backward compatibility
        const trackIndex = state.tracks.findIndex(
          (currentTrack) => currentTrack._id === action.payload.track._id
        );

        if (trackIndex !== -1) {
          const currentPlaylists = state.tracks[trackIndex].playlist ?? [];
          const isLiked = currentPlaylists.includes("Liked Songs");

          if (isLiked) {
            state.tracks[trackIndex].playlist = currentPlaylists.filter(
              (playlist) => playlist !== "Liked Songs"
            );
            state.tracks[trackIndex].rating = 0;
          } else {
            state.tracks[trackIndex].playlist = [...currentPlaylists, "Liked Songs"];
            state.tracks[trackIndex].rating = 1;
          }
        }
      })
      .addCase(toggleTrackFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to toggle favorite";
      });

    // Update playlist
    builder
      .addCase(updatePlaylistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlaylistAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Update the playlist in apiPlaylists
        const playlistIndex = state.apiPlaylists.findIndex(
          (p) => p._id === action.payload._id
        );
        if (playlistIndex !== -1) {
          state.apiPlaylists[playlistIndex] = action.payload;
        }

        // Update in local metadata
        const metadataIndex = state.playlistsMetadata.findIndex(
          (p) => p.name === action.payload.name
        );
        if (metadataIndex !== -1) {
          state.playlistsMetadata[metadataIndex] = {
            name: action.payload.name,
            customImage: action.payload.coverImageUrl,
            description: action.payload.description,
            isDefault: action.payload.isDefault,
          };
        }
      })
      .addCase(updatePlaylistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update playlist";
      });

    // Delete playlist
    builder
      .addCase(deletePlaylistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlaylistAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Find playlist to remove before filtering
        const playlistToRemove = state.apiPlaylists.find((p) => p._id === action.payload);

        // Remove from apiPlaylists
        state.apiPlaylists = state.apiPlaylists.filter((p) => p._id !== action.payload);

        // Remove from local metadata
        if (playlistToRemove) {
          state.playlistsMetadata = state.playlistsMetadata.filter(
            (p) => p.name !== playlistToRemove.name
          );
        }
      })
      .addCase(deletePlaylistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete playlist";
      });

    // Remove song from playlist
    builder
      .addCase(removeSongFromPlaylistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSongFromPlaylistAsync.fulfilled, (state, action) => {
        state.loading = false;

        // Update the playlist in apiPlaylists
        const playlistIndex = state.apiPlaylists.findIndex(
          (p) => p._id === action.payload._id
        );
        if (playlistIndex !== -1) {
          state.apiPlaylists[playlistIndex] = action.payload;
        }
      })
      .addCase(removeSongFromPlaylistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to remove song from playlist";
      });
  },
});

export const {
  toggleTrackFavorite,
  addToPlaylist,
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  updatePlaylistImage,
  updatePlaylistDescription,
} = librarySlice.actions;

export default librarySlice.reducer;
