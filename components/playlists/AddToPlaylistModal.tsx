import { songsService } from "@/services/songsService";
import { useApiPlaylists } from "@/store/hooks";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
  onSongAdded?: () => void; // Callback to refresh playlist
  currentPlaylistSongs?: Track[]; // Current songs in the playlist to filter out
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  onClose,
  playlistId,
  playlistName,
  onSongAdded,
  currentPlaylistSongs = [],
}) => {
  const { top } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addSongToPlaylist } = useApiPlaylists();

  // Helper function to filter out songs already in the playlist
  const filterAvailableSongs = useCallback(
    (songs: Track[]): Track[] => {
      return songs.filter(
        (song) =>
          !currentPlaylistSongs.some(
            (playlistSong) =>
              playlistSong._id === song._id || playlistSong.fileUrl === song.fileUrl
          )
      );
    },
    [currentPlaylistSongs]
  );

  // Search songs based on query
  const searchSongs = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await songsService.searchSongs(query.trim(), {
          limit: 20,
        });
        // Filter out songs already in the playlist
        const availableSongs = filterAvailableSongs(response.tracks);
        setSearchResults(availableSongs);
      } catch {
        console.error("Error searching songs");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [filterAvailableSongs]
  );

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSongs(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchSongs]);

  const loadSuggestedSongs = useCallback(async () => {
    try {
      // Load popular songs as suggestions
      const response = await songsService.getPopularSongs(10);
      // Filter out songs already in the playlist
      const availableSongs = filterAvailableSongs(response.tracks);
      setSuggestedSongs(availableSongs);
    } catch {
      console.error("Error loading suggested songs");
      setSuggestedSongs([]);
    }
  }, [filterAvailableSongs]);

  useEffect(() => {
    if (visible) {
      loadSuggestedSongs();
    } else {
      // Reset search when modal closes
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [visible, loadSuggestedSongs]);

  const handleAddSong = async (song: Track) => {
    try {
      await addSongToPlaylist(playlistId, song._id);
      Alert.alert("Success", `Added "${song.title}" to playlist`);
      onSongAdded?.(); // Trigger refresh
    } catch {
      Alert.alert("Error", "Failed to add song to playlist");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4"
          style={{
            paddingTop: top + 8,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#fff",
            }}
          >
            Add to this playlist
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-4">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={{
                fontSize: 16,
                color: "#fff",
                flex: 1,
              }}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4">
          {isSearching ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 8,
                }}
              >
                Searching...
              </Text>
            </View>
          ) : searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <View className="mb-4">
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                    color: "#fff",
                    marginBottom: 16,
                  }}
                >
                  Search Results
                </Text>

                {searchResults.map((song, index) => (
                  <TouchableOpacity
                    key={song._id || index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {song.thumbnailUrl ? (
                        <Image
                          source={{ uri: song.thumbnailUrl }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="musical-note"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#fff",
                          fontWeight: "500",
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {song.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.6)",
                        }}
                        numberOfLines={1}
                      >
                        {song.artist?.name || "Unknown Artist"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleAddSong(song)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.3)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="add" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 60,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={64}
                  color="rgba(255,255,255,0.3)"
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#fff",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  No new songs found
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.6)",
                    textAlign: "center",
                  }}
                >
                  Try different keywords or all matching songs are already in this
                  playlist
                </Text>
              </View>
            )
          ) : suggestedSongs.length > 0 ? (
            <View className="mb-4">
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                Suggested
              </Text>

              {suggestedSongs.map((song, index) => (
                <TouchableOpacity
                  key={song._id || index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="play" size={20} color="rgba(255,255,255,0.6)" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#fff",
                        fontWeight: "500",
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                      }}
                      numberOfLines={1}
                    >
                      {song.artist?.name || "Unknown Artist"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleAddSong(song)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.3)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="add" size={20} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <Ionicons
                name="musical-notes-outline"
                size={64}
                color="rgba(255,255,255,0.3)"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#fff",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                All popular songs are already in your playlist
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                }}
              >
                Try searching for specific songs to add to &quot;{playlistName}&quot;
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
