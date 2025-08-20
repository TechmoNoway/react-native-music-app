import { isTrackLiked } from "@/helpers/trackHelpers";
import { useUser } from "@/hooks/useUser";
import AudioService, { useActiveTrack } from "@/services/audioService";
import { useFavorites } from "@/store/hooks";
import { useCallback } from "react";

export const useTrackPlayerFavorite = () => {
  const activeTrack = useActiveTrack();
  const { user } = useUser();
  const { favorites, toggleTrackFavorite } = useFavorites();

  const favoriteTrack = favorites.find((track) => track.fileUrl === activeTrack?.fileUrl);

  // Check favorite status using the helper function
  const isFavorite = favoriteTrack ? isTrackLiked(favoriteTrack, user?.id) : false;

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
