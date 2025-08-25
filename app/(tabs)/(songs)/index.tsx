import { TracksList } from "@/components/songs/TracksList";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { songsService } from "@/services/songsService";
import { defaultStyles } from "@/styles";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const musicGenres = [
  { name: "All", color: "#6c5ce7", icon: "apps" },
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
  const { top, bottom } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async (searchQuery?: string) => {
    setLoading(true);

    try {
      let response;
      if (searchQuery && searchQuery.trim()) {
        response = await songsService.searchSongs(searchQuery);
      } else {
        response = await songsService.getAllSongs({});
      }

      const songs = response.tracks || [];
      const transformedSongs: Track[] = songs.map((item: any) => ({
        _id: item._id || `song_${Math.random()}`,
        title: item.title || "Unknown Song",
        artist: item.artist || {
          _id: "unknown",
          name: "Unknown Artist",
        },
        duration: item.duration || 180,
        genre: item.genre || "Other",
        fileUrl: item.fileUrl || "",
        thumbnailUrl:
          item.thumbnailUrl || `https://picsum.photos/300/300?random=${Math.random()}`,
        isPublic: item.isPublic !== false,
        playCount: item.playCount || 0,
        likedBy: item.likedBy || [],
        likesCount: item.likesCount || 0,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

      setSongs(transformedSongs);
    } catch (err) {
      console.error("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    let filtered = songs;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof song.artist === "string" ? song.artist : song.artist.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== "All") {
      filtered = filtered.filter((song) => song.genre === selectedGenre);
    }

    return filtered;
  }, [searchQuery, selectedGenre, songs]);

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    fetchSongs();
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
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Info Message */}
        <View className="bg-blue-900/30 p-3 rounded-lg mb-4">
          <Text className="text-blue-300 text-sm">
            🎵 Browse songs by genre or search for your favorite tracks!
          </Text>
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
            marginBottom: 20,
          }}
        >
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 12 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs..."
            className="flex-1 text-[#666] text-base"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ marginLeft: 12 }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Genre Filter */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {musicGenres.map((genre) => (
                <TouchableOpacity
                  key={genre.name}
                  onPress={() => setSelectedGenre(genre.name)}
                  style={{
                    backgroundColor:
                      selectedGenre === genre.name
                        ? genre.color
                        : "rgba(255,255,255,0.1)",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderWidth: selectedGenre === genre.name ? 2 : 0,
                    borderColor: selectedGenre === genre.name ? "#fff" : "transparent",
                  }}
                >
                  <Ionicons
                    name={genre.icon as any}
                    size={16}
                    color={selectedGenre === genre.name ? "#000" : "#fff"}
                  />
                  <Text
                    style={{
                      color: selectedGenre === genre.name ? "#000" : "#fff",
                      fontWeight: selectedGenre === genre.name ? "bold" : "normal",
                    }}
                  >
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="py-8">
            <Text className="text-white text-center">Loading songs...</Text>
          </View>
        )}

        {/* Content */}
        {!loading && (
          <View>
            {filteredSongs.length > 0 ? (
              <View>
                <Text className="text-white text-lg font-semibold mb-4">
                  {searchQuery
                    ? `Search Results (${filteredSongs.length})`
                    : selectedGenre === "All"
                    ? `All Songs (${filteredSongs.length})`
                    : `${selectedGenre} Songs (${filteredSongs.length})`}
                </Text>
                <TracksList
                  hideQueueControls={true}
                  id={generateTracksListId("songs", `${selectedGenre}-${searchQuery}`)}
                  tracks={filteredSongs}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <View className="py-8">
                <Text className="text-white text-center">
                  {searchQuery
                    ? `No songs found for "${searchQuery}"`
                    : selectedGenre === "All"
                    ? "No songs available"
                    : `No ${selectedGenre} songs available`}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SongsScreen;
