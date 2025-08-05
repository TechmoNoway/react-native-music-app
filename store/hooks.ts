import { Artist, Playlist, TrackWithPlaylist } from "@/helpers/types";
import { Track } from "@/types/audio";
import { createSelector } from "@reduxjs/toolkit";
import { RootState, useAppDispatch, useAppSelector } from "./index";
import {
  addToPlaylist as addToPlaylistAction,
  createPlaylist as createPlaylistAction,
  deletePlaylist as deletePlaylistAction,
  renamePlaylist as renamePlaylistAction,
  toggleTrackFavorite as toggleTrackFavoriteAction,
  updatePlaylistDescription as updatePlaylistDescriptionAction,
  updatePlaylistImage as updatePlaylistImageAction,
} from "./librarySlice";
import {
  clearActiveQueueId,
  setActiveQueueId as setActiveQueueIdAction,
} from "./queueSlice";
import { login as loginAction, logout as logoutAction } from "./userSlice";

const unknownTrackImageUri = "https://via.placeholder.com/300x300?text=Unknown+Track";

// Selectors
const selectTracks = (state: RootState) => state.library.tracks;
const selectPlaylistsMetadata = (state: RootState) => state.library.playlistsMetadata;
const selectActiveQueueId = (state: RootState) => state.queue.activeQueueId;

const selectFavoriteTracks = createSelector(
  [selectTracks],
  (tracks: TrackWithPlaylist[]) => tracks.filter((track) => track.rating === 1)
);

const selectArtists = createSelector([selectTracks], (tracks: TrackWithPlaylist[]) => {
  return tracks.reduce((acc: Artist[], track: TrackWithPlaylist) => {
    const existingArtist = acc.find((artist: Artist) => artist.name === track.artist);

    if (existingArtist) {
      existingArtist.tracks.push(track);
    } else {
      acc.push({
        name: track.artist ?? "Unknown",
        tracks: [track],
      });
    }

    return acc;
  }, [] as Artist[]);
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
              (metadata?.customImage || track.artwork) ?? unknownTrackImageUri,
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

// user

const selectUser = (state: RootState) => state.user;

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const login = (usernameOrEmail: string, password: string) => {
    dispatch(loginAction({ usernameOrEmail, password }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    login,
    logout,
  };
};
