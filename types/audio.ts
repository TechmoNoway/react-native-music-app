export interface Artist {
  _id: string;
  name: string;
  imageUrl?: string;
}

export interface Track {
  _id: string;
  title: string;
  artist: Artist;
  duration: number;
  genre: string;
  fileUrl: string;
  thumbnailUrl: string;
  lyrics?: string | null;
  isPublic: boolean;
  playCount: number;
  uploadedBy?: string | null;
  likedBy?: string[]; // Array of user IDs who liked this song
  likesCount?: number; // Total number of likes
  isLiked?: boolean; // Frontend computed field
  createdAt: string;
  updatedAt: string;
  url?: string;
  rating?: number;
  playlist?: string[];
}

export interface AVStatus {
  isLoaded: boolean;
  isPlaying?: boolean;
  position?: number;
  duration?: number;
  rate?: number;
  volume?: number;
  isMuted?: boolean;
  error?: string;
}

export enum RepeatMode {
  Off = "off",
  Track = "one",
  Queue = "all",
}

export enum Capability {
  Play = "play",
  Pause = "pause",
  SkipToNext = "skipToNext",
  SkipToPrevious = "skipToPrevious",
  Stop = "stop",
}

export enum RatingType {
  Heart = "heart",
  ThumbsUpDown = "thumbsUpDown",
  FiveStars = "fiveStars",
}
