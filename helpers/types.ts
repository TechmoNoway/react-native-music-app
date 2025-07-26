import { Track } from "@/types/audio";

export type Playlist = {
  name: string;
  tracks: Track[];
  artworkPreview: string;
};

export type Artist = {
  name: string;
  tracks: Track[];
};

export type TrackWithPlaylist = Track & { playlist?: string[] };
