import { TracksList } from "@/components/songs/TracksList";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

const API_BASE_URL = "https://nodejs-music-app-backend.vercel.app/api";

const SongsScreen = () => {
  const [search, setSearch] = useState("");
  const [apiSongs, setApiSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const tracks = useTracks();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  const fetchSongs = async (searchQuery?: string) => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/songs`, {
        params: {
          search: searchQuery || "",
        },
        timeout: 10000,
      });

      const transformedSongs: Track[] = response.data.data.songs.map((item: any) => ({
        _id: item._id || `song_${item.id}`,
        title: item.title || `Song ${item.id}`,
        artist: {
          _id: item.artist?._id || `artist_${item.userId || "unknown"}`,
          name: item.artist?.name || `Artist ${item.userId}` || "Unknown Artist",
        },
        duration: item.duration || Math.floor(Math.random() * 300) + 120,
        genre: item.genre || "Unknown",
        fileUrl: item.fileUrl || `https://example.com/song/${item.id}.mp3`,
        thumbnailUrl:
          item.thumbnailUrl || `https://picsum.photos/300/300?random=${item.id}`,
        lyrics: item.lyrics,
        isPublic: item.isPublic !== false,
        playCount: item.playCount || 0,
        uploadedBy: item.uploadedBy || "unknown",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

      setApiSongs(transformedSongs);
    } catch (err) {
      console.error("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) {
      setApiSongs([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/songs`, {
        params: {
          search: query,
        },
        timeout: 10000,
      });

      const transformedSongs: Track[] = response.data.data.songs
        .filter((item: any) => item.title.toLowerCase().includes(query.toLowerCase()))
        .map((item: any) => ({
          _id: item._id || `song_${item.id}`,
          title: item.title,
          artist: {
            _id: item.artist?._id || `artist_${item.userId || "unknown"}`,
            name: item.artist?.name || `Artist ${item.userId}` || "Unknown Artist",
          },
          duration: item.duration || Math.floor(Math.random() * 300) + 120,
          genre: item.genre || "Search Results",
          fileUrl: item.fileUrl || `https://example.com/song/${item.id}.mp3`,
          thumbnailUrl:
            item.thumbnailUrl || `https://picsum.photos/300/300?random=${item.id}`,
          lyrics: item.lyrics,
          isPublic: item.isPublic !== false,
          playCount: item.playCount || 0,
          uploadedBy: item.uploadedBy || "unknown",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

      setApiSongs(transformedSongs);
    } catch (err) {
      console.error("Error searching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search) {
        searchSongs(search);
      } else {
        setApiSongs([]);
        fetchSongs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredTracks = useMemo(() => {
    if (!search) return tracks;
    return tracks.filter(trackTitleFilter(search));
  }, [search, tracks]);

  const transformedTracks = useMemo(() => {
    return apiSongs.map((song) => ({
      _id: song._id,
      title: song.title,
      artist:
        typeof song.artist === "string"
          ? { _id: "unknown", name: song.artist }
          : song.artist,
      duration: song.duration || 0,
      genre: song.genre || "Unknown",
      fileUrl: song.fileUrl || "",
      thumbnailUrl: song.thumbnailUrl || "",
      lyrics: song.lyrics,
      isPublic: song.isPublic !== false,
      playCount: song.playCount || 0,
      uploadedBy: song.uploadedBy || "unknown",
      createdAt: song.createdAt || new Date().toISOString(),
      updatedAt: song.updatedAt || new Date().toISOString(),
    }));
  }, [apiSongs]);

  const handleGenrePress = (genre: string) => {
    router.push({
      pathname: "/(tabs)/(songs)/genre/[genre]",
      params: { genre: genre.toLowerCase() },
    });
  };

  const handleRefresh = () => {
    setSearch("");
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
            placeholder="Search songs from API..."
            className="flex-1 text-[#666] text-base"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} style={{ marginLeft: 12 }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Content */}
        {search ? (
          <View>
            {/* API Search Results */}
            {transformedTracks.length > 0 && (
              <View className="mb-6">
                <Text className="text-white text-lg font-semibold mb-4">
                  API Results ({transformedTracks.length})
                </Text>
                <TracksList
                  hideQueueControls={true}
                  id={generateTracksListId("api-songs", search)}
                  tracks={tracks}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Local Search Results */}
            {filteredTracks.length > 0 && (
              <View>
                <Text className="text-white text-lg font-semibold mb-4">
                  Local Results ({filteredTracks.length})
                </Text>
                <TracksList
                  hideQueueControls={true}
                  id={generateTracksListId("local-songs", search)}
                  tracks={filteredTracks}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* No Results */}
            {!loading &&
              transformedTracks.length === 0 &&
              filteredTracks.length === 0 && (
                <View className="py-8">
                  <Text className="text-white text-center">
                    No songs found for &quot;{search}&quot;
                  </Text>
                </View>
              )}
          </View>
        ) : (
          <View>
            {/* API Songs Section */}
            {tracks.length > 0 && (
              <View>
                <Text className="text-white text-lg font-semibold">Popular Songs</Text>
                <TracksList
                  hideQueueControls={true}
                  id={generateTracksListId("api-popular", "popular")}
                  tracks={tracks.slice(0, 5)}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Browse All Section */}
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
              {musicGenres.map((genre) => (
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
