import { colors } from "@/constants/tokens";
import AudioService from "@/services/audioService";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View, ViewProps } from "react-native";

type QueueControlsProps = {
  tracks: Track[];
} & ViewProps;

export const QueueControls = ({ tracks, style, ...viewProps }: QueueControlsProps) => {
  const handlePlay = async () => {
    await AudioService.setQueue(tracks);
    await AudioService.play();
  };

  const handleShufflePlay = async () => {
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);

    await AudioService.setQueue(shuffledTracks);
    await AudioService.play();
  };

  return (
    <View className="flex-row gap-4" style={style} {...viewProps}>
      {/* Play button */}
      <View className="flex-1">
        <Pressable
          onPress={handlePlay}
          className="p-3 bg-neutral-800/50 rounded-lg flex-row justify-center items-center gap-2"
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="play" size={22} color={colors.primary} />

          <Text
            style={{
              color: colors.primary,
              fontWeight: "600",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            Play
          </Text>
        </Pressable>
      </View>

      {/* Shuffle button */}
      <View className="flex-1">
        <Pressable
          onPress={handleShufflePlay}
          className="p-3 bg-neutral-800/50 rounded-lg flex-row justify-center items-center gap-2"
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name={"shuffle-sharp"} size={24} color={colors.primary} />

          <Text
            style={{
              color: colors.primary,
              fontWeight: "600",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            Shuffle
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
