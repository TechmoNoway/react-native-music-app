import library from "@/assets/data/library.json";
import { TrackWithPlaylist } from "@/helpers/types";
import { Track } from "@/types/audio";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LibraryState {
  tracks: TrackWithPlaylist[];
}

const initialState: LibraryState = {
  tracks: library,
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
        state.tracks[trackIndex].rating = state.tracks[trackIndex].rating === 1 ? 0 : 1;
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
  },
});

export const { toggleTrackFavorite, addToPlaylist } = librarySlice.actions;
export default librarySlice.reducer;
