import { TracksList } from "@/components/songs/TracksList";
import { colors } from "@/constants/tokens";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GenreScreen = () => {
  const { genre } = useLocalSearchParams<{ genre: string }>();
  const [search, setSearch] = useState("");
  const tracks = useTracks();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  // Filter tracks by genre (you can implement genre filtering logic here)
  const genreTracks = useMemo(() => {
    // For now, we'll show all tracks. You can implement genre filtering based on your data structure
    return tracks;
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    if (!search) return genreTracks;
    return genreTracks.filter(trackTitleFilter(search));
  }, [search, genreTracks]);

  const genreName = genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : "Genre";

  return (
    <View className={defaultStyles.container}>
      <ScrollView
        className="px-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: top + 8,
        }}
        contentContainerStyle={{
          paddingBottom: Math.max(bottom + 60, 110),
        }}
      >
        {/* Header Section */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-[28px] font-bold">{genreName}</Text>
        </View>

        {/* Search Input */}
        <View
          className="flex-row items-center rounded-xl px-4 py-3 mb-5"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <Ionicons name="search" size={20} color={colors.primary} className="mr-3" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Find in ${genreName}`}
            placeholderTextColor={colors.textMuted}
            className="flex-1 text-white text-base"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.primary}
                className="ml-2"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Genre Info */}
        <View className="mb-6">
          <Text className="text-neutral-400 text-base">
            {filteredTracks.length} song{filteredTracks.length !== 1 ? "s" : ""} in{" "}
            {genreName}
          </Text>
        </View>

        <TracksList
          id={generateTracksListId(`genre-${genre}`, search)}
          tracks={filteredTracks}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

export default GenreScreen;
