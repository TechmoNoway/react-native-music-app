import { TracksList } from "@/components/songs/TracksList";
import { unknownArtistImageUri } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { useArtistDetail } from "@/hooks/useArtistDetail";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ArtistDetailScreen = () => {
  const { name: artistId } = useLocalSearchParams<{ name: string }>();
  const { top } = useSafeAreaInsets();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const { artist, tracks, loading, error, refetch } = useArtistDetail(artistId || "");

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading artist...</Text>
      </View>
    );
  }

  // Error state
  if (error || !artist) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-4">
        <Ionicons name="alert-circle-outline" size={80} color={colors.textMuted} />
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "600",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Artist Not Found
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 16,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {error || "The artist you're looking for doesn't exist."}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 24,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 16,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 80);
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#4c1d95", "#000000"]}
        locations={[0, 0.3]}
        style={{ flex: 1 }}
      >
        {/* Sticky Header when scrolled */}
        {isScrolled && (
          <View
            className="absolute top-0 left-0 right-0 z-20 px-4"
            style={{
              paddingTop: top + 4,
              paddingBottom: 4,
              backgroundColor: "rgba(0,0,0,0.95)",
              borderBottomWidth: 0.5,
              borderBottomColor: "rgba(255,255,255,0.1)",
            }}
          >
            <View className="flex-row items-center" style={{ height: 40 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ width: 44, alignItems: "flex-start" }}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#fff",
                  flex: 1,
                  textAlign: "left",
                  marginLeft: 8,
                }}
              >
                {artist.name}
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          className="flex-1"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: top + 10,
            paddingBottom: 100,
          }}
        >
          {/* Header with back button */}
          <View className="px-4">
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Artist Header with large background image */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Image
                source={{
                  uri: artist.imageUrl || unknownArtistImageUri,
                }}
                style={{
                  width: 232,
                  height: 232,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
                contentFit="cover"
              />
            </View>

            {/* Artist Name */}
            <Text
              numberOfLines={2}
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {artist.name}
            </Text>

            {/* Artist Bio */}
            {artist.bio && (
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                {artist.bio}
              </Text>
            )}

            {/* Genres */}
            {artist.genres && artist.genres.length > 0 && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                {artist.genres.map((genre, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "500" }}>
                      {genre}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Song Count */}
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 24,
              }}
            >
              {tracks.length} song{tracks.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Songs List with gradient overlay */}
          <LinearGradient
            colors={["transparent", "#000000"]}
            locations={[0, 0.1]}
            style={{ flex: 1 }}
          >
            {tracks.length > 0 ? (
              <TracksList
                id={generateTracksListId(artist.name)}
                tracks={tracks}
                scrollEnabled={false}
                hideQueueControls={true}
              />
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 32 }}>
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                  No songs found for this artist
                </Text>
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default ArtistDetailScreen;
