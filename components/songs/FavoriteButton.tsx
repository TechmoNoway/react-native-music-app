import { colors } from "@/constants/tokens";
import { getLikeErrorMessage, isTrackLiked } from "@/helpers/trackHelpers";
import { useUser } from "@/hooks/useUser";
import { playlistService } from "@/services/playlistService";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

type FavoriteButtonProps = {
  track: Track;
  isFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
};

export const FavoriteButton = ({
  track,
  isFavorite = false,
  onToggle,
}: FavoriteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Determine initial favorite state from API data or prop
  const initialFavorite = isTrackLiked(track, user?.id) || isFavorite;

  const [favorite, setFavorite] = useState(initialFavorite);

  // Update local state when track data changes
  useEffect(() => {
    const newFavorite = isTrackLiked(track, user?.id) || isFavorite;
    setFavorite(newFavorite);
  }, [track, user?.id, isFavorite]);

  const handleToggleFavorite = async () => {
    if (isLoading || !user) return;

    try {
      setIsLoading(true);

      if (favorite) {
        // Unlike the song
        const result = await playlistService.unlikeSong(track);

        // Update track's likedBy array locally
        if (user?.id && track.likedBy) {
          track.likedBy = track.likedBy.filter((id) => id !== user.id.toString());
          track.likesCount = result.likesCount;
        }

        setFavorite(false);
      } else {
        // Like the song
        const result = await playlistService.likeSong(track);

        // Update track's likedBy array locally
        if (user?.id && track.likedBy) {
          track.likedBy.push(user.id.toString());
          track.likesCount = result.likesCount;
        }

        setFavorite(true);
      }

      onToggle?.(!favorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", getLikeErrorMessage(!favorite), [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleFavorite}
      disabled={isLoading}
      style={{
        padding: 8,
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={24}
          color={favorite ? "#e91e63" : colors.icon}
        />
      )}
    </TouchableOpacity>
  );
};

// Test component to easily test adding songs to favorites
export const FavoriteTestButton = ({ track }: { track: Track }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>
          {track.title}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
          {typeof track.artist === "string" ? track.artist : track.artist.name}
        </Text>
      </View>
      <FavoriteButton track={track} />
    </View>
  );
};
