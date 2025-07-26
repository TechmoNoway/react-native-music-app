import { StopPropagation } from "@/components/utils/StopPropagation";
import { unknownTrackImageUri } from "@/constants/images";
import { colors, fontSize } from "@/constants/tokens";
import { useActiveTrack, useIsPlaying } from "@/services/audioService";
import { Track } from "@/types/audio";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ActivityIndicator, Text, TouchableHighlight, View } from "react-native";
import { TrackShortcutsMenu } from "./TrackShortcutsMenu";

export type TracksListItemProps = {
  track: Track;
  onTrackSelect: (track: Track) => void;
};

export const TracksListItem = ({
  track,
  onTrackSelect: handleTrackSelect,
}: TracksListItemProps) => {
  const { playing } = useIsPlaying();

  const isActiveTrack = useActiveTrack()?.url === track.url;

  return (
    <TouchableHighlight
      onPress={() => handleTrackSelect(track)}
      underlayColor="rgba(255,255,255,0.1)"
    >
      <View className="flex-row gap-3.5 items-center pr-5 py-2 bg-black">
        <View className="relative">
          <Image
            source={{
              uri: track.artwork ?? unknownTrackImageUri,
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              opacity: isActiveTrack ? 0.6 : 1,
            }}
            contentFit="cover"
            transition={300}
            placeholder={{ uri: "https://via.placeholder.com/48x48/333/fff?text=♪" }}
            placeholderContentFit="contain"
            cachePolicy="memory-disk"
          />

          {isActiveTrack &&
            (playing ? (
              <ActivityIndicator
                style={{
                  position: "absolute",
                  top: 18,
                  left: 16,
                  width: 16,
                  height: 16,
                }}
                size="small"
                color={colors.icon}
              />
            ) : (
              <Ionicons
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                }}
                name="play"
                size={24}
                color={colors.icon}
              />
            ))}
        </View>

        <View className="flex-1 flex-row justify-between items-center">
          {/* Track title + artist */}
          <View style={{ width: "100%" }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: fontSize.sm,
                fontWeight: "600",
                maxWidth: "90%",
                color: isActiveTrack ? colors.primary : colors.text,
              }}
            >
              {track.title}
            </Text>

            {track.artist && (
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textMuted,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {track.artist}
              </Text>
            )}
          </View>

          <StopPropagation>
            <TrackShortcutsMenu track={track}>
              <Entypo name="dots-three-horizontal" size={18} color={colors.icon} />
            </TrackShortcutsMenu>
          </StopPropagation>
        </View>
      </View>
    </TouchableHighlight>
  );
};
