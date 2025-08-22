import {
  ArtistWithTracks,
  Playlist,
  TrackWithPlaylist,
  convertApiPlaylistToPlaylist,
} from "@/helpers/types";
import { Track } from "@/types/audio";
import { createSelector } from "@reduxjs/toolkit";
import {
  addSongToPlaylistAsync,
  addToPlaylist as addToPlaylistAction,
  createPlaylist as createPlaylistAction,
  createPlaylistAsync,
  deletePlaylist as deletePlaylistAction,
  deletePlaylistAsync,
  fetchUserPlaylists,
  removeSongFromPlaylistAsync,
  renamePlaylist as renamePlaylistAction,
  toggleTrackFavorite as toggleTrackFavoriteAction,
  toggleTrackFavoriteAsync,
  updatePlaylistAsync,
  updatePlaylistDescription as updatePlaylistDescriptionAction,
  updatePlaylistImage as updatePlaylistImageAction,
} from "./librarySlice";
import {
  clearActiveQueueId,
  setActiveQueueId as setActiveQueueIdAction,
} from "./queueSlice";
import { RootState, useAppDispatch, useAppSelector } from "./store";
import { login as loginAction, logout as logoutAction } from "./userSlice";

const unknownTrackImageUri = "https://via.placeholder.com/300x300?text=Unknown+Track";

// Selectors
const selectTracks = (state: RootState) => state.library.tracks;
const selectPlaylistsMetadata = (state: RootState) => state.library.playlistsMetadata;
const selectActiveQueueId = (state: RootState) => state.queue.activeQueueId;
const selectApiPlaylists = (state: RootState) => state.library.apiPlaylists;
const selectLibraryLoading = (state: RootState) => state.library.loading;
const selectLibraryError = (state: RootState) => state.library.error;

const selectFavoriteTracks = createSelector(
  [selectTracks],
  (tracks: TrackWithPlaylist[]) => tracks.filter((track) => track.isPublic === true)
);

const selectArtists = createSelector([selectTracks], (tracks: TrackWithPlaylist[]) => {
  return tracks.reduce((acc: ArtistWithTracks[], track: TrackWithPlaylist) => {
    const artistName = track.artist?.name ?? "Unknown";
    const existingArtist = acc.find(
      (artist: ArtistWithTracks) => artist.name === artistName
    );

    if (existingArtist) {
      existingArtist.tracks.push(track);
    } else {
      acc.push({
        name: artistName,
        tracks: [track],
      });
    }

    return acc;
  }, [] as ArtistWithTracks[]);
});

const selectPlaylists = createSelector(
  [selectTracks, selectPlaylistsMetadata],
  (tracks: TrackWithPlaylist[], playlistsMetadata) => {
    const playlists = tracks.reduce((acc: Playlist[], track: TrackWithPlaylist) => {
      track.playlist?.forEach((playlistName: string) => {
        const existingPlaylist = acc.find(
          (playlist: Playlist) => playlist.name === playlistName
        );

        if (existingPlaylist) {
          existingPlaylist.tracks.push(track);
        } else {
          const metadata = playlistsMetadata.find((m) => m.name === playlistName);
          acc.push({
            name: playlistName,
            tracks: [track],
            artworkPreview:
              (metadata?.customImage || track.thumbnailUrl) ?? unknownTrackImageUri,
            isDefault: metadata?.isDefault ?? false,
            customImage: metadata?.customImage,
            description: metadata?.description,
          });
        }
      });

      return acc;
    }, [] as Playlist[]);

    // Add empty playlists from metadata that don't have tracks yet
    playlistsMetadata.forEach((metadata) => {
      const existingPlaylist = playlists.find((p) => p.name === metadata.name);
      if (!existingPlaylist) {
        playlists.push({
          name: metadata.name,
          tracks: [],
          artworkPreview: metadata.customImage ?? unknownTrackImageUri,
          isDefault: metadata.isDefault,
          customImage: metadata.customImage,
          description: metadata.description,
        });
      }
    });

    // Ensure "Liked Songs" playlist always appears first
    const likedSongsPlaylist = playlists.find((p) => p.name === "Liked Songs");
    const otherPlaylists = playlists.filter((p) => p.name !== "Liked Songs");

    if (likedSongsPlaylist) {
      return [likedSongsPlaylist, ...otherPlaylists];
    } else {
      // Create empty Liked Songs playlist if it doesn't exist
      return [
        {
          name: "Liked Songs",
          tracks: [],
          artworkPreview: unknownTrackImageUri,
          isDefault: true,
        },
        ...otherPlaylists,
      ];
    }
  }
);

// API Playlists selector that converts to UI format
const selectApiPlaylistsAsUI = createSelector([selectApiPlaylists], (apiPlaylists) => {
  return apiPlaylists.map(convertApiPlaylistToPlaylist);
});

// Hooks
export const useTracks = () => {
  return useAppSelector(selectTracks);
};

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavoriteTracks);

  const toggleTrackFavorite = (track: Track) => {
    dispatch(toggleTrackFavoriteAction(track));
  };

  return {
    favorites,
    toggleTrackFavorite,
  };
};

export const useArtists = () => {
  return useAppSelector(selectArtists);
};

export const usePlaylists = () => {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector(selectPlaylists);

  const addToPlaylist = (track: Track, playlistName: string) => {
    dispatch(addToPlaylistAction({ track, playlistName }));
  };

  const createPlaylist = (name: string, customImage?: string, description?: string) => {
    dispatch(createPlaylistAction({ name, customImage, description }));
  };

  const deletePlaylist = (name: string) => {
    dispatch(deletePlaylistAction(name));
  };

  const renamePlaylist = (oldName: string, newName: string) => {
    dispatch(renamePlaylistAction({ oldName, newName }));
  };

  const updatePlaylistImage = (name: string, customImage: string) => {
    dispatch(updatePlaylistImageAction({ name, customImage }));
  };

  const updatePlaylistDescription = (name: string, description: string) => {
    dispatch(updatePlaylistDescriptionAction({ name, description }));
  };

  return {
    playlists,
    addToPlaylist,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    updatePlaylistImage,
    updatePlaylistDescription,
  };
};

export const useQueue = () => {
  const dispatch = useAppDispatch();
  const activeQueueId = useAppSelector(selectActiveQueueId);

  const setActiveQueueId = (id: string) => {
    dispatch(setActiveQueueIdAction(id));
  };

  const clearQueue = () => {
    dispatch(clearActiveQueueId());
  };

  return {
    activeQueueId,
    setActiveQueueId,
    clearQueue,
  };
};

// API Playlists Hooks
export const useApiPlaylists = () => {
  const dispatch = useAppDispatch();
  const apiPlaylists = useAppSelector(selectApiPlaylistsAsUI);
  const loading = useAppSelector(selectLibraryLoading);
  const error = useAppSelector(selectLibraryError);

  const fetchPlaylists = (filters?: { type?: string; search?: string }) => {
    dispatch(fetchUserPlaylists(filters));
  };

  const createPlaylist = (playlistData: {
    name: string;
    description?: string;
    coverImageUrl?: string;
  }) => {
    return dispatch(createPlaylistAsync(playlistData));
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    return dispatch(addSongToPlaylistAsync({ playlistId, songId }));
  };

  const toggleFavorite = (track: Track) => {
    return dispatch(toggleTrackFavoriteAsync(track));
  };

  const updatePlaylist = (
    playlistId: string,
    updateData: { name?: string; description?: string; coverImageUrl?: string }
  ) => {
    return dispatch(updatePlaylistAsync({ playlistId, updateData }));
  };

  const deletePlaylist = (playlistId: string) => {
    return dispatch(deletePlaylistAsync(playlistId));
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    return dispatch(removeSongFromPlaylistAsync({ playlistId, songId }));
  };

  return {
    apiPlaylists,
    loading,
    error,
    fetchPlaylists,
    createPlaylist,
    addSongToPlaylist,
    toggleFavorite,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
  };
};

// Enhanced favorites hook with API integration
export const useEnhancedFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavoriteTracks);
  const loading = useAppSelector(selectLibraryLoading);

  // Local toggle for backward compatibility
  const toggleTrackFavorite = (track: Track) => {
    dispatch(toggleTrackFavoriteAction(track));
  };

  // API toggle with backend sync
  const toggleTrackFavoriteWithApi = (track: Track) => {
    return dispatch(toggleTrackFavoriteAsync(track));
  };

  return {
    favorites,
    loading,
    toggleTrackFavorite,
    toggleTrackFavoriteWithApi,
  };
};

// user
const selectUser = (state: RootState) => state.user;

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const login = (usernameOrEmail: string, password: string) => {
    dispatch(loginAction({ usernameOrEmail, password }));
  };

  const loginWithUserData = (userData: any) => {
    dispatch(loginAction(userData));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    login,
    loginWithUserData,
    logout,
  };
};
