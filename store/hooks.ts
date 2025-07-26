import { Artist, Playlist, TrackWithPlaylist } from "@/helpers/types";
import { Track } from "@/types/audio";
import { createSelector } from "@reduxjs/toolkit";
import { RootState, useAppDispatch, useAppSelector } from "./index";
import {
  addToPlaylist as addToPlaylistAction,
  toggleTrackFavorite as toggleTrackFavoriteAction,
} from "./librarySlice";
import {
  clearActiveQueueId,
  setActiveQueueId as setActiveQueueIdAction,
} from "./queueSlice";

const unknownTrackImageUri = "https://via.placeholder.com/300x300?text=Unknown+Track";

// Selectors
const selectTracks = (state: RootState) => state.library.tracks;
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

const selectPlaylists = createSelector([selectTracks], (tracks: TrackWithPlaylist[]) => {
  return tracks.reduce((acc: Playlist[], track: TrackWithPlaylist) => {
    track.playlist?.forEach((playlistName: string) => {
      const existingPlaylist = acc.find(
        (playlist: Playlist) => playlist.name === playlistName
      );

      if (existingPlaylist) {
        existingPlaylist.tracks.push(track);
      } else {
        acc.push({
          name: playlistName,
          tracks: [track],
          artworkPreview: track.artwork ?? unknownTrackImageUri,
        });
      }
    });

    return acc;
  }, [] as Playlist[]);
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

  return { playlists, addToPlaylist };
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
