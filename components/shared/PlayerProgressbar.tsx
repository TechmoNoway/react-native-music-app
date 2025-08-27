import { colors, fontSize } from "@/constants/tokens";
import { formatSecondsToMinutes } from "@/helpers/miscellaneous";
import AudioService, { useProgress } from "@/services/audioService";
import { useEffect } from "react";
import { Text, View, ViewProps } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";

export type PlayerProgressbarProps = {
  style?: ViewProps["style"];
};

export const PlayerProgressbar = ({ style }: PlayerProgressbarProps) => {
  const { position, duration } = useProgress(250);

  const isSliding = useSharedValue(false);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  const trackElapsedTime = formatSecondsToMinutes(position);
  const trackRemainingTime = formatSecondsToMinutes(duration - position);

  useEffect(() => {
    progress.value = duration > 0 ? position / duration : 0;
  }, [position, duration, progress]);

  return (
    <View style={style}>
      <Slider
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        containerStyle={{
          height: 7,
          borderRadius: 16,
        }}
        thumbWidth={0}
        renderBubble={() => null}
        theme={{
          minimumTrackTintColor: colors.minimumTrackTintColor,
          maximumTrackTintColor: colors.maximumTrackTintColor,
        }}
        onSlidingStart={() => (isSliding.value = true)}
        onValueChange={async (value) => {
          await AudioService.seekTo(value * duration);
        }}
        onSlidingComplete={async (value) => {
          if (!isSliding.value) return;
          isSliding.value = false;
          await AudioService.seekTo(value * duration);
        }}
      />

      <View className="flex-row justify-between items-baseline mt-5">
        <Text
          style={{
            color: colors.text,
            opacity: 0.75,
            fontSize: fontSize.xs,
            letterSpacing: 0.7,
            fontWeight: "500",
          }}
        >
          {trackElapsedTime}
        </Text>

        <Text
          style={{
            color: colors.text,
            opacity: 0.75,
            fontSize: fontSize.xs,
            letterSpacing: 0.7,
            fontWeight: "500",
          }}
        >
          -{trackRemainingTime}
        </Text>
      </View>
    </View>
  );
};
