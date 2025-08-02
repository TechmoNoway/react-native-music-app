import { TrackShortcutsMenu } from "@/components/songs/TrackShortcutsMenu";
import { StopPropagation } from "@/components/utils/StopPropagation";
import { unknownTrackImageUri } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { useActiveTrack, useIsPlaying } from "@/services/audioService";
import { Track } from "@/types/audio";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import { Text, TouchableHighlight, View } from "react-native";

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
      <View className="flex-row gap-3 items-center px-2 py-2 bg-black">
        <View className="relative">
          <Image
            source={{
              uri: track.artwork ?? unknownTrackImageUri,
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 4,
              opacity: isActiveTrack ? 0.6 : 1,
            }}
            contentFit="cover"
            transition={300}
            placeholder={{ uri: "https://via.placeholder.com/56x56/333/fff?text=♪" }}
            placeholderContentFit="contain"
            cachePolicy="memory-disk"
          />

          {isActiveTrack &&
            (playing ? (
              <LottieView
                source={require("../../assets/LineScaleParty.json")}
                autoPlay
                loop
                resizeMode="contain"
                style={{
                  position: "absolute",
                  top: -4,
                  left: -4,
                  width: 64,
                  height: 64,
                }}
              />
            ) : (
              <Ionicons
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                }}
                name="play"
                size={24}
                color={colors.icon}
              />
            ))}
        </View>

        <View className="flex-1 flex-row justify-between items-center">
          {/* Track title + artist */}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: isActiveTrack ? "#3b82f6" : "#fff",
                marginBottom: 2,
              }}
            >
              {track.title}
            </Text>

            {track.artist && (
              <Text
                numberOfLines={1}
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                }}
              >
                {track.artist}
              </Text>
            )}
          </View>

          <StopPropagation>
            <TrackShortcutsMenu track={track}>
              <Entypo
                name="dots-three-vertical"
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TrackShortcutsMenu>
          </StopPropagation>
        </View>
      </View>
    </TouchableHighlight>
  );
};
