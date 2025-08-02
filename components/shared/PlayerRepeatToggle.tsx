import { colors } from "@/constants/tokens";
import { useTrackPlayerRepeatMode } from "@/hooks/useTrackPlayerRepeatMode";
import { RepeatMode } from "@/types/audio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, "name">;
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const repeatOrder = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue] as const;

export const PlayerRepeatToggle = ({ ...iconProps }: IconProps) => {
  const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode();

  const toggleRepeatMode = () => {
    if (repeatMode == null) return;

    const currentIndex = repeatOrder.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % repeatOrder.length;

    changeRepeatMode(repeatOrder[nextIndex]);
  };

  const getRepeatIcon = (mode: RepeatMode | null | undefined): IconName => {
    switch (mode) {
      case RepeatMode.Off:
        return "repeat-off";
      case RepeatMode.Track:
        return "repeat-once";
      case RepeatMode.Queue:
        return "repeat";
      default:
        return "repeat-off";
    }
  };

  const icon = getRepeatIcon(repeatMode);

  return (
    <MaterialCommunityIcons
      name={icon}
      onPress={toggleRepeatMode}
      color={colors.icon}
      {...iconProps}
    />
  );
};
