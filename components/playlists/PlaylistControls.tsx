import AudioService from "@/services/audioService";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, ViewProps } from "react-native";

type PlaylistControlsProps = {
  tracks: Track[];
} & ViewProps;

export const PlaylistControls = ({
  tracks,
  style,
  ...viewProps
}: PlaylistControlsProps) => {
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
    <View className="flex-row gap-3" style={style} {...viewProps}>
      {/* Play button - icon only */}
      <Pressable
        onPress={handlePlay}
        className="w-12 h-12 bg-[#3b82f6] rounded-full justify-center items-center"
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="play" size={20} color="white" />
      </Pressable>

      {/* Shuffle button - icon only */}
      <Pressable
        onPress={handleShufflePlay}
        className="w-12 h-12 bg-neutral-800/80 rounded-full justify-center items-center"
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="shuffle-sharp" size={18} color="#3b82f6" />
      </Pressable>
    </View>
  );
};
