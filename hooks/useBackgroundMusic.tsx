import { useActiveTrack, useIsPlaying } from "@/services/audioService";

export const useBackgroundMusic = () => {
  const activeTrack = useActiveTrack();
  const { playing } = useIsPlaying();

  return {
    activeTrack,
    isPlaying: playing,
  };
};
