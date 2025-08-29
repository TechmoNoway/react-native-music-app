import { colors } from "@/constants/tokens";
import { useTrackPlayerVolume } from "@/hooks/useTrackPlayerVolume";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";

type VolumeControlProps = {
  iconSize?: number;
};

export const VolumeControl = ({ iconSize = 28 }: VolumeControlProps) => {
  const { volume, updateVolume } = useTrackPlayerVolume();
  const [showSlider, setShowSlider] = useState(false);

  const progress = useSharedValue(volume || 0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  useEffect(() => {
    if (volume !== undefined) {
      progress.value = volume;
    }
  }, [volume, progress]);

  const handleVolumePress = () => {
    setShowSlider(!showSlider);
  };

  const handleOutsidePress = () => {
    setShowSlider(false);
  };

  const handleVolumeChange = useCallback(
    (value: number) => {
      updateVolume(value);
    },
    [updateVolume]
  );

  const getVolumeIcon = () => {
    if (!volume || volume === 0) return "volume-mute";
    if (volume < 0.5) return "volume-low";
    return "volume-high";
  };

  return (
    <View className="items-center relative">
      <TouchableOpacity activeOpacity={0.7} onPress={handleVolumePress}>
        <Ionicons name={getVolumeIcon()} size={iconSize} color={colors.text} />
      </TouchableOpacity>

      {showSlider && (
        <>
          {/* Invisible overlay to detect taps outside */}
          <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View
              style={{
                position: "absolute",
                top: -200,
                left: -200,
                right: -200,
                bottom: -100,
                zIndex: 5,
              }}
            />
          </TouchableWithoutFeedback>

          {/* Volume slider */}
          <View
            className="absolute items-center z-10"
            style={{
              bottom: 60,
              height: 50,
              width: 40,
              transform: [{ rotate: "-90deg" }],
              zIndex: 15, // Higher than overlay
            }}
          >
            <View
              style={{
                backgroundColor: colors.background + "95",
                borderRadius: 8,
                padding: 8,
                borderWidth: 1,
                borderColor: colors.textMuted + "30",
              }}
            >
              <Slider
                style={{
                  width: 80,
                  height: 30,
                }}
                progress={progress}
                minimumValue={min}
                maximumValue={max}
                thumbWidth={12}
                onValueChange={handleVolumeChange}
                theme={{
                  minimumTrackTintColor: colors.primary,
                  maximumTrackTintColor: colors.textMuted + "50",
                  bubbleBackgroundColor: colors.primary,
                  heartbeatColor: colors.primary,
                }}
                renderBubble={() => null} // Hide the bubble
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};
