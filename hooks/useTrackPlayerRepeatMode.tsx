import AudioService from "@/services/audioService";
import { RepeatMode } from "@/types/audio";
import { useCallback, useEffect, useState } from "react";

export const useTrackPlayerRepeatMode = () => {
  const [repeatMode, setRepeatMode] = useState<RepeatMode>();

  const changeRepeatMode = useCallback(async (repeatMode: RepeatMode) => {
    await AudioService.setRepeatMode(repeatMode);

    setRepeatMode(repeatMode);
  }, []);

  useEffect(() => {
    AudioService.getRepeatMode().then(setRepeatMode);
  }, []);

  return { repeatMode, changeRepeatMode };
};
