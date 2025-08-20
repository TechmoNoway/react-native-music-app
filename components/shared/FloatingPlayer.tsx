import { MovingText } from "@/components/shared/MovingText";
import { PlayPauseButton } from "@/components/shared/PlayerControls";
import { unknownTrackImageUri } from "@/constants/images";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack, useProgress } from "@/services/audioService";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";

export const FloatingPlayer = ({ style }: ViewProps) => {
  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const { position, duration } = useProgress();

  const displayedTrack = activeTrack ?? lastActiveTrack;

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  if (!displayedTrack) return null;

  return (
    <Link href="/player" asChild>
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-row items-center bg-neutral-800 p-2 rounded-xl py-2.5"
        style={style}
      >
        <Image
          source={{
            uri: displayedTrack.thumbnailUrl ?? unknownTrackImageUri,
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
          }}
          contentFit="cover"
        />

        <View className="flex-1 overflow-hidden ml-2.5">
          <MovingText
            style={{
              fontSize: 18,
              fontWeight: "600",
              paddingLeft: 10,
              color: "#fff",
            }}
            text={displayedTrack.title ?? ""}
            animationThreshold={25}
          />
          <Text
            style={{
              fontSize: 14,
              color: "#ccc",
              paddingLeft: 10,
            }}
            numberOfLines={1}
          >
            {typeof displayedTrack.artist === "string"
              ? displayedTrack.artist
              : displayedTrack.artist?.name ?? "Unknown Artist"}
          </Text>
        </View>

        <View className="flex-row items-center gap-5 mr-4 pl-4">
          <PlayPauseButton iconSize={24} />
        </View>

        {/* Thin progress bar at the bottom */}
        <View className="absolute bottom-0 left-[2.5%] right-[2.5%] h-0.5 bg-white/10">
          <View
            className="h-full bg-blue-400"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
};
