import { MovingText } from "@/components/shared/MovingText";
import { PlayerControls } from "@/components/shared/PlayerControls";
import { PlayerProgressbar } from "@/components/shared/PlayerProgressbar";
import { unknownTrackImageUri } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { usePlayerBackground } from "@/hooks/usePlayerBackground";
import { useTrackPlayerFavorite } from "@/hooks/useTrackPlayerFavorite";
import { useActiveTrack } from "@/services/audioService";
import { defaultStyles } from "@/styles";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const router = useRouter();
  const { imageColors } = usePlayerBackground(
    activeTrack?.thumbnailUrl ?? unknownTrackImageUri
  );

  const { top, bottom } = useSafeAreaInsets();

  const { isFavorite, toggleFavorite } = useTrackPlayerFavorite();

  const handleMinimize = () => {
    router.back();
  };

  if (!activeTrack) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className={`${defaultStyles.container} ${defaultStyles.justifyCenter}`}>
          <ActivityIndicator color={colors.icon} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "card",
          gestureEnabled: true,
          gestureDirection: "vertical",
          animationDuration: 400,
        }}
      />
      <LinearGradient
        className="flex-1"
        colors={
          imageColors
            ? [
                imageColors.background || imageColors.primary, // Use background color first
                (imageColors.background || imageColors.primary) + "EE", // Very high opacity
                (imageColors.background || imageColors.primary) + "CC", // High opacity
                (imageColors.background || imageColors.primary) + "88", // Medium opacity
                (imageColors.background || imageColors.primary) + "44", // Low opacity
                "#1a1a1a", // Dark gray
                "#000000", // Pure black at bottom
              ]
            : [colors.primary, colors.primary + "88", "#1a1a1a", "#000000"]
        }
        locations={imageColors ? [0, 0.08, 0.18, 0.35, 0.55, 0.75, 1] : [0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View className="flex-1 px-6">
          {/* Background blur effect */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.2, // Slightly higher opacity
            }}
          >
            <Image
              source={{
                uri: activeTrack.thumbnailUrl ?? unknownTrackImageUri,
              }}
              contentFit="cover"
              style={{
                width: "100%",
                height: "100%",
              }}
              blurRadius={50}
            />
          </View>

          {/* Dark overlay with gradient for text readability */}
          <LinearGradient
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            colors={[
              "rgba(0, 0, 0, 0)", // Transparent at top to show artwork color
              "rgba(0, 0, 0, 0.1)", // Very light
              "rgba(0, 0, 0, 0.3)", // Light
              "rgba(0, 0, 0, 0.6)", // Medium
              "rgba(0, 0, 0, 0.9)", // Very dark at bottom
            ]}
            locations={[0, 0.2, 0.4, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          <View className="flex-1" style={{ marginTop: top + 8, marginBottom: bottom }}>
            {/* Header với thông tin bài hát */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                {/* Nút thu nhỏ */}
                <TouchableOpacity onPress={handleMinimize} className="p-2">
                  <Ionicons name="chevron-down" size={24} color="white" />
                </TouchableOpacity>

                {/* Thông tin bài hát */}
                <View className="flex-1 items-center px-4">
                  <Text className="text-white text-xs font-medium opacity-70 uppercase tracking-wider">
                    PLAYING FROM ARTIST
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-white text-sm font-semibold mt-0.5"
                  >
                    {(typeof activeTrack.artist === "string"
                      ? activeTrack.artist
                      : activeTrack.artist?.name) || "Unknown Artist"}
                  </Text>
                </View>

                {/* Nút menu */}
                <TouchableOpacity className="p-2">
                  <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Thumbnail artwork */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                height: "35%", // Giảm height để có chỗ cho header
                shadowColor: imageColors?.primary || colors.primary,
                shadowOffset: {
                  width: 0,
                  height: 10,
                },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 20,
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  shadowColor: imageColors?.primary || colors.primary,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.8,
                  shadowRadius: 25,
                  elevation: 25,
                }}
              >
                <Image
                  source={{
                    uri: activeTrack.thumbnailUrl ?? unknownTrackImageUri,
                  }}
                  contentFit="cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  }}
                />
              </View>
            </View>

            <View className="flex-1">
              <View className="mt-auto mb-8">
                <View className="h-[60px]">
                  <View className="flex-row justify-between items-center">
                    {/* Track title */}
                    <View className="flex-1 overflow-hidden">
                      <MovingText
                        text={activeTrack.title ?? ""}
                        animationThreshold={30}
                        style={{ fontSize: 22, fontWeight: "700", color: "white" }}
                      />
                    </View>

                    {/* Favorite button icon */}
                    <FontAwesome
                      name={isFavorite ? "heart" : "heart-o"}
                      size={20}
                      color={
                        isFavorite ? imageColors?.primary || colors.primary : colors.icon
                      }
                      className="mx-3.5"
                      onPress={toggleFavorite}
                    />
                  </View>

                  {/* Track artist */}
                  {activeTrack.artist && (
                    <Text
                      numberOfLines={1}
                      className="text-white text-base opacity-80 max-w-[90%] mt-1.5"
                    >
                      {typeof activeTrack.artist === "string"
                        ? activeTrack.artist
                        : activeTrack.artist.name}
                    </Text>
                  )}
                </View>

                <PlayerProgressbar style={{ marginTop: 32 }} />

                <PlayerControls style={{ marginTop: 40 }} />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

export default PlayerScreen;
