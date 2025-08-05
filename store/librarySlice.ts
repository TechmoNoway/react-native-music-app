import library from "@/assets/data/library.json";
import { PlaylistMetadata, TrackWithPlaylist } from "@/helpers/types";
import { Track } from "@/types/audio";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LibraryState {
  tracks: TrackWithPlaylist[];
  playlistsMetadata: PlaylistMetadata[];
}

const initialState: LibraryState = {
  tracks: library,
  playlistsMetadata: [
    {
      name: "Liked Songs",
      isDefault: true,
    },
  ],
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    toggleTrackFavorite: (state, action: PayloadAction<Track>) => {
      const track = action.payload;
      const trackIndex = state.tracks.findIndex(
        (currentTrack) => currentTrack.url === track.url
      );

      if (trackIndex !== -1) {
        const currentPlaylists = state.tracks[trackIndex].playlist ?? [];
        const isLiked = currentPlaylists.includes("Liked Songs");

        if (isLiked) {
          // Remove from Liked Songs
          state.tracks[trackIndex].playlist = currentPlaylists.filter(
            (playlist) => playlist !== "Liked Songs"
          );
          state.tracks[trackIndex].rating = 0;
        } else {
          // Add to Liked Songs
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
        (currentTrack) => currentTrack.url === track.url
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

      // Check if playlist already exists
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

      // Don't allow deleting default playlists
      const playlist = state.playlistsMetadata.find((p) => p.name === playlistName);
      if (playlist && !playlist.isDefault) {
        // Remove playlist metadata
        state.playlistsMetadata = state.playlistsMetadata.filter(
          (p) => p.name !== playlistName
        );

        // Remove tracks from this playlist
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

      // Don't allow renaming default playlists
      const playlist = state.playlistsMetadata.find((p) => p.name === oldName);
      if (playlist && !playlist.isDefault) {
        // Update playlist metadata
        playlist.name = newName;

        // Update tracks
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
