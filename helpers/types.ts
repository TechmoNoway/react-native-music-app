import { Track } from "@/types/audio";

export type Playlist = {
  name: string;
  tracks: Track[];
  artworkPreview: string;
  isDefault?: boolean; // true for "Liked Songs", false for user-created playlists
  customImage?: string; // custom image URL for user-created playlists
  description?: string; // playlist description
};

export type Artist = {
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
