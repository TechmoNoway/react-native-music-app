import { colors } from "@/constants/tokens";
import { playlistService } from "@/services/playlistService";
import { PlaylistApiResponse } from "@/types/api";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PlaylistSelectorProps = {
  track: Track;
  onPlaylistSelect: (playlist: PlaylistApiResponse) => void;
  onClose: () => void;
  isAddingToPlaylist?: boolean;
  addingPlaylistName?: string;
};

export const PlaylistSelector = ({
  track,
  onPlaylistSelect,
  onClose,
  isAddingToPlaylist = false,
  addingPlaylistName,
}: PlaylistSelectorProps) => {
  const [playlists, setPlaylists] = useState<PlaylistApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { playlists: userPlaylists } = await playlistService.getUserPlaylists({
        type: "custom", // Only show custom playlists, not liked songs
      });

      // Don't filter out playlists - show all of them
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error("Error loading playlists:", err);
      setError("Failed to load playlists");
      Alert.alert("Error", "Failed to load playlists. Please try again.", [
        { text: "OK", onPress: onClose },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const renderPlaylistItem = ({ item }: { item: PlaylistApiResponse }) => {
    const isCurrentlyAdding = isAddingToPlaylist && addingPlaylistName === item.name;
    const isTrackInPlaylist = item.songs.some((song) => song._id === track._id);

    const handlePlaylistPress = () => {
      if (isTrackInPlaylist) {
        Alert.alert("Info", "This song is already in the playlist.", [{ text: "OK" }]);
        return;
      }
      onPlaylistSelect(item);
    };

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          opacity:
            (isAddingToPlaylist && !isCurrentlyAdding) || isTrackInPlaylist ? 0.6 : 1,
        }}
        onPress={handlePlaylistPress}
        disabled={isAddingToPlaylist}
      >
        <Image
          source={{
            uri: item.coverImageUrl || "https://via.placeholder.com/50x50/333/fff?text=♪",
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            marginRight: 12,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
              {item.description}
            </Text>
          )}
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {item.songs.length} songs
            {isTrackInPlaylist && " • Already added"}
          </Text>
        </View>

        {isCurrentlyAdding ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : isTrackInPlaylist ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        ) : (
          <Ionicons name="add" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading playlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
      >
        <Ionicons name="alert-circle" size={48} color={colors.icon} />
        <Text style={{ color: colors.text, marginTop: 12, textAlign: "center" }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 16,
          }}
          onPress={loadPlaylists}
        >
          <Text style={{ color: "white", fontWeight: "500" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (playlists.length === 0) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
      >
        <Ionicons name="musical-notes" size={48} color={colors.icon} />
        <Text style={{ color: colors.text, marginTop: 12, textAlign: "center" }}>
          No playlists available
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: "center" }}>
          Create a new playlist to get started
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            padding: 8,
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
            flex: 1,
          }}
        >
          Add &quot;{track.title}&quot; to playlist
        </Text>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading overlay when adding to playlist */}
      {isAddingToPlaylist && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.backgroundCard,
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
              minWidth: 200,
            }}
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Adding to &quot;{addingPlaylistName}&quot;...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
