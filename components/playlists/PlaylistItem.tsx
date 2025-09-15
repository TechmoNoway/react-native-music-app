import { colors } from "@/constants/tokens";
import { Playlist } from "@/helpers/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableHighlight, View } from "react-native";

interface PlaylistItemProps {
  playlist: Playlist;
  onPress: (playlist: Playlist) => void;
}

export const PlaylistItem = ({ playlist, onPress }: PlaylistItemProps) => {
  const isLikedSongs = playlist.name === "Liked Songs";
  const isRecentlyPlayed = playlist.name === "Recently Played";

  return (
    <TouchableHighlight
      activeOpacity={0.8}
      onPress={() => onPress(playlist)}
      className="rounded-xl overflow-hidden mb-3"
    >
      <View className="flex-row items-center p-3 bg-neutral-900/50 rounded-xl">
        {/* Playlist Cover */}
        <View className="relative mr-4">
          {isLikedSongs ? (
            <LinearGradient
              colors={["#8B5CF6", "#3B82F6"]}
              className="w-14 h-14 rounded-lg items-center justify-center"
            >
              <Ionicons name="heart" size={24} color="white" />
            </LinearGradient>
          ) : isRecentlyPlayed ? (
            <LinearGradient
              colors={["#10B981", "#059669"]}
              className="w-14 h-14 rounded-lg items-center justify-center"
            >
              <Ionicons name="time" size={24} color="white" />
            </LinearGradient>
          ) : (
            <Image
              source={{ uri: playlist.artworkPreview }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
              }}
              contentFit="cover"
            />
          )}
        </View>

        {/* Playlist Info */}
        <View className="flex-1">
          <Text className="text-white text-base font-semibold mb-1" numberOfLines={1}>
            {playlist.name}
          </Text>
          <View className="flex-row items-center">
            {isLikedSongs && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.primary}
                className="mr-1"
              />
            )}
            <Text className="text-neutral-400 text-sm">
              Playlist • {playlist.tracks.length} song
              {playlist.tracks.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableHighlight>
  );
};
