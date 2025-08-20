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

  // Debug user data
  console.log("FavoriteButton user data:", {
    user: user,
    userId: user?.id,
    userIdType: typeof user?.id,
    userMongoId: (user as any)?._id,
    hasUser: !!user,
  });

  // Get user ID - try both id and _id fields
  const getUserId = () => {
    // Temporarily hardcode the user ID for testing
    const hardcodedUserId = "689c790732d9912b9f9347b2";

    if (!user) {
      console.log("No user found, using hardcoded ID:", hardcodedUserId);
      return hardcodedUserId;
    }

    const userId = user.id || (user as any)._id;
    console.log("getUserId result:", {
      hasUser: !!user,
      userId: userId,
      userIdType: typeof userId,
      userRaw: user,
      usingHardcoded: !userId,
      finalUserId: userId || hardcodedUserId,
    });

    // If no user ID from user object, use hardcoded for testing
    return userId || hardcodedUserId;
  };

  const currentUserId = getUserId();

  // Initialize favorite state properly
  const [favorite, setFavorite] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Update local state when track data changes
  useEffect(() => {
    const newFavorite = isTrackLiked(track, currentUserId) || isFavorite;

    console.log("FavoriteButton useEffect - Setting favorite:", {
      trackTitle: track.title,
      currentUserId: currentUserId,
      likedBy: track.likedBy,
      isTrackLikedResult: isTrackLiked(track, currentUserId),
      isFavoriteProp: isFavorite,
      newFavorite: newFavorite,
      initialized: initialized,
      currentFavorite: favorite,
    });

    // Only update if the value actually changed to prevent unnecessary re-renders
    if (newFavorite !== favorite || !initialized) {
      setFavorite(newFavorite);
      if (!initialized) {
        setInitialized(true);
      }
    }
  }, [track, currentUserId, isFavorite, user?.id, initialized, favorite]);

  const handleToggleFavorite = async () => {
    if (isLoading || !currentUserId) return;

    try {
      setIsLoading(true);

      // Optimistic update: Update UI immediately for better UX
      const newFavoriteState = !favorite;
      setFavorite(newFavoriteState);

      if (favorite) {
        // Update local state immediately
        if (track.likedBy) {
          track.likedBy = track.likedBy.filter((id) => id !== currentUserId.toString());
          track.likesCount = Math.max(0, (track.likesCount || 1) - 1);
        }

        // Then call API
        const result = await playlistService.unlikeSong(track);

        // Update with actual count from server
        if (result.likesCount !== undefined) {
          track.likesCount = result.likesCount;
        }
      } else {
        // Update local state immediately
        if (track.likedBy) {
          track.likedBy.push(currentUserId.toString());
          track.likesCount = (track.likesCount || 0) + 1;
        }

        // Then call API
        const result = await playlistService.likeSong(track);

        // Update with actual count from server
        if (result.likesCount !== undefined) {
          track.likesCount = result.likesCount;
        }
      }

      onToggle?.(newFavoriteState);
    } catch (error) {
      console.error("Error toggling favorite:", error);

      // Revert UI state on error
      setFavorite(favorite);

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
