import AudioService, { useActiveTrack } from "@/services/audioService";
import { useFavorites } from "@/store/hooks";
import { useCallback } from "react";

export const useTrackPlayerFavorite = () => {
  const activeTrack = useActiveTrack();

  const { favorites, toggleTrackFavorite } = useFavorites();

  const isFavorite =
    favorites.find((track) => track.fileUrl === activeTrack?.fileUrl)?.rating === 1;

  // we're updating both the track player internal state and application internal state
  const toggleFavorite = useCallback(async () => {
    const id = await AudioService.getActiveTrackIndex();

    if (id == null) return;

    // update track player internal state
    await AudioService.updateMetadataForTrack(id, {
      rating: isFavorite ? 0 : 1,
    });

    // update the app internal state
    if (activeTrack) {
      toggleTrackFavorite(activeTrack);
    }
  }, [isFavorite, toggleTrackFavorite, activeTrack]);

  return { isFavorite, toggleFavorite };
};
