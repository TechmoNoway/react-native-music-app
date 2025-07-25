import AudioService from "@/services/audioService";
import { Capability, RatingType, RepeatMode } from "@/types/audio";
import { useEffect, useRef } from "react";

const setupPlayer = async () => {
  await AudioService.setupPlayer({
    maxCacheSize: 1024 * 10,
  });

  await AudioService.updateOptions({
    ratingType: RatingType.Heart,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
  });

  await AudioService.setVolume(0.3); // not too loud
  await AudioService.setRepeatMode(RepeatMode.Queue);
};

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    setupPlayer()
      .then(() => {
        isInitialized.current = true;
        onLoad?.();
      })
      .catch((error) => {
        isInitialized.current = false;
        console.error(error);
      });
  }, [onLoad]);
};
