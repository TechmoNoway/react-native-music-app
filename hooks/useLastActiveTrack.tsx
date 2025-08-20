import { useActiveTrack } from "@/services/audioService";
import { Track } from "@/types/audio";
import { useEffect, useState } from "react";

export const useLastActiveTrack = () => {
  const activeTrack = useActiveTrack();
  const [lastActiveTrack, setLastActiveTrack] = useState<Track>();

  useEffect(() => {
    if (!activeTrack) return;

    setLastActiveTrack(activeTrack);
  }, [activeTrack]);

  return lastActiveTrack;
};
