import AudioService from "@/services/audioService";
import { useCallback, useEffect, useState } from "react";

export const useTrackPlayerVolume = () => {
  const [volume, setVolume] = useState<number | undefined>(undefined);

  const getVolume = useCallback(async () => {
    const currentVolume = await AudioService.getVolume();
    setVolume(currentVolume);
  }, []);

  const updateVolume = useCallback(async (newVolume: number) => {
    if (newVolume < 0 || newVolume > 1) return;

    setVolume(newVolume);

    await AudioService.setVolume(newVolume);
  }, []);

  useEffect(() => {
    getVolume();
  }, [getVolume]);

  return { volume, updateVolume };
};
