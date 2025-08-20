import { colors } from "@/constants/tokens";
import AudioService, { useCanSkip, useIsPlaying } from "@/services/audioService";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { PlayerRepeatToggle } from "./PlayerRepeatToggle";
import { VolumeControl } from "./VolumeControl";

type PlayerControlsProps = {
  style?: ViewStyle;
};

type PlayerButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export const PlayerControls = ({ style }: PlayerControlsProps) => {
  return (
    <View className="w-full" style={style}>
      <View className="flex-row justify-between items-center px-4" style={{ gap: 16 }}>
        {/* Left: Loop/Repeat Toggle */}
        <View className="flex-1 items-start">
          <PlayerRepeatToggle size={28} />
        </View>

        {/* Center: Main playback controls */}
        <View className="flex-row justify-center items-center flex-2" style={{ gap: 24 }}>
          <SkipToPreviousButton />
          <PlayPauseButton />
          <SkipToNextButton />
        </View>

        {/* Right: Volume Control */}
        <View className="flex-1 items-end">
          <VolumeControl iconSize={28} />
        </View>
      </View>
    </View>
  );
};

export const PlayPauseButton = ({ style, iconSize = 70 }: PlayerButtonProps) => {
  const { playing } = useIsPlaying();

  return (
    <TouchableOpacity
      style={[
        {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          backgroundColor: colors.text,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
      activeOpacity={0.8}
      onPress={playing ? AudioService.pause : AudioService.play}
    >
      <Ionicons
        name={playing ? "pause" : "play"}
        size={iconSize * 0.4}
        color={colors.background}
        style={{ marginLeft: playing ? 0 : 2 }} // Slight offset for play icon
      />
    </TouchableOpacity>
  );
};

export const SkipToNextButton = ({ iconSize = 32 }: PlayerButtonProps) => {
  const { canSkipNext } = useCanSkip();

  return (
    <TouchableOpacity
      activeOpacity={canSkipNext ? 0.7 : 1}
      onPress={canSkipNext ? () => AudioService.skipToNext() : undefined}
      disabled={!canSkipNext}
    >
      <Ionicons
        name="play-skip-forward"
        size={iconSize}
        color={canSkipNext ? colors.text : colors.textMuted}
      />
    </TouchableOpacity>
  );
};

export const SkipToPreviousButton = ({ iconSize = 32 }: PlayerButtonProps) => {
  const { canSkipPrevious } = useCanSkip();

  return (
    <TouchableOpacity
      activeOpacity={canSkipPrevious ? 0.7 : 1}
      onPress={canSkipPrevious ? () => AudioService.skipToPrevious() : undefined}
      disabled={!canSkipPrevious}
    >
      <Ionicons
        name="play-skip-back"
        size={iconSize}
        color={canSkipPrevious ? colors.text : colors.textMuted}
      />
    </TouchableOpacity>
  );
};
