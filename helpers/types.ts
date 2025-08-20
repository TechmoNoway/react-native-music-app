import { PlaylistApiResponse } from "@/types/api";
import { Track } from "@/types/audio";

export type Playlist = {
  name: string;
  tracks: Track[];
  artworkPreview: string;
  isDefault?: boolean;
  customImage?: string;
  description?: string;
};

export type ArtistWithTracks = {
  name: string;
  tracks: Track[];
};

export type TrackWithPlaylist = Track & { playlist?: string[] };

export type PlaylistMetadata = {
  name: string;
  customImage?: string;
  description?: string;
  isDefault: boolean;
};

export const convertApiPlaylistToPlaylist = (
  apiPlaylist: PlaylistApiResponse
): Playlist => {
  return {
    name: apiPlaylist.name,
    tracks: apiPlaylist.songs,
    artworkPreview: apiPlaylist.coverImageUrl || getPlaylistArtwork(apiPlaylist.songs),
    isDefault: apiPlaylist.isDefault,
    customImage: apiPlaylist.coverImageUrl,
    description: apiPlaylist.description,
  };
};

const getPlaylistArtwork = (songs: Track[]): string => {
  if (songs.length === 0) {
    return "https://via.placeholder.com/300x300?text=Empty+Playlist";
  }

  return songs[0].thumbnailUrl || "https://via.placeholder.com/300x300?text=Playlist";
};
