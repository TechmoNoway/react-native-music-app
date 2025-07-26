// Types for audio functionality using expo-av

export interface Track {
  url: string;
  title?: string;
  artist?: string;
  artwork?: string;
  duration?: number;
  rating?: number;
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
