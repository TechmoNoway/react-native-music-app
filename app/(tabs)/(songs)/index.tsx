import { TracksList } from "@/components/songs/TracksList";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Music genres with colors
const musicGenres = [
  { name: "Pop", color: "#ff6b6b", icon: "musical-notes" },
  { name: "Rock", color: "#4ecdc4", icon: "flash" },
  { name: "Hip Hop", color: "#45b7d1", icon: "mic" },
  { name: "Electronic", color: "#96ceb4", icon: "radio" },
  { name: "Jazz", color: "#feca57", icon: "musical-note" },
  { name: "Classical", color: "#ff9ff3", icon: "library" },
  { name: "R&B", color: "#54a0ff", icon: "heart" },
  { name: "Country", color: "#5f27cd", icon: "leaf" },
  { name: "Reggae", color: "#00d2d3", icon: "sunny" },
  { name: "Blues", color: "#ff6348", icon: "sad" },
  { name: "Folk", color: "#2ed573", icon: "flower" },
  { name: "Indie", color: "#ffa502", icon: "star" },
];

const SongsScreen = () => {
  const [search, setSearch] = useState("");
  const tracks = useTracks();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const filteredTracks = useMemo(() => {
    if (!search) return tracks;

    return tracks.filter(trackTitleFilter(search));
  }, [search, tracks]);

  const handleGenrePress = (genre: string) => {
    // Navigate to genre detail page
    router.push({
      pathname: "/(tabs)/(songs)/genre/[genre]",
      params: { genre: genre.toLowerCase() },
    });
  };

  return (
    <View className={defaultStyles.container}>
      <ScrollView
        className="px-4"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: top + 10,
        }}
        contentContainerStyle={{
          paddingBottom: Math.max(bottom + 60, 110),
        }}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Text className="text-white text-[32px] font-bold">Songs</Text>
          </View>
        </View>

        {/* Search Input */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 5,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="What do you want to listen to?"
            className="flex-1 text-[#666] text-base"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} style={{ marginLeft: 12 }}>
              <Ionicons name="close-circle" size={20} color="#666" className="ml-2" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Browse All Section */}
        {search ? (
          <TracksList
            hideQueueControls={true}
            id={generateTracksListId("songs", search)}
            tracks={filteredTracks}
            scrollEnabled={false}
          />
        ) : (
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Browse all
            </Text>

            {/* Genre Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {musicGenres.map((genre, index) => (
                <TouchableOpacity
                  key={genre.name}
                  onPress={() => handleGenrePress(genre.name)}
                  style={{
                    width: "48%",
                    height: 100,
                    backgroundColor: genre.color,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    {genre.name}
                  </Text>
                  <View style={{ alignSelf: "flex-end" }}>
                    <Ionicons name={genre.icon as any} size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SongsScreen;
