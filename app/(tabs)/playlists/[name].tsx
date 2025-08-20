import { PlaylistTracksList } from "@/components/playlists/PlaylistTracksList";
import { colors, fontSize } from "@/constants/tokens";
import { convertApiPlaylistToPlaylist } from "@/helpers/types";
import { playlistService } from "@/services/playlistService";
import { usePlaylists } from "@/store/hooks";
import { PlaylistApiResponse } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Predefined gradient colors for different playlist types
const getPlaylistGradient = (playlistName: string): [string, string] => {
  const gradients: Record<string, [string, string]> = {
    "Liked Songs": ["#3b4371", "#000000"],
    "Recently Played": ["#1e3a8a", "#000000"],
    "Top Hits": ["#dc2626", "#000000"],
    "Chill Mix": ["#059669", "#000000"],
    "Rock Classics": ["#7c2d12", "#000000"],
    "Pop Hits": ["#db2777", "#000000"],
    "Jazz Collection": ["#92400e", "#000000"],
    Electronic: ["#7c3aed", "#000000"],
  };

  // Use playlist name hash to generate consistent colors
  const hash = playlistName.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const colors = [
    ["#1e40af", "#000000"], // Blue
    ["#dc2626", "#000000"], // Red
    ["#059669", "#000000"], // Green
    ["#7c2d12", "#000000"], // Orange
    ["#7c3aed", "#000000"], // Purple
    ["#db2777", "#000000"], // Pink
    ["#0891b2", "#000000"], // Cyan
    ["#65a30d", "#000000"], // Lime
  ];

  return (
    gradients[playlistName] ||
    (colors[Math.abs(hash) % colors.length] as [string, string])
  );
};

const PlaylistScreen = () => {
  const { name: playlistName } = useLocalSearchParams<{ name: string }>();
  const { top } = useSafeAreaInsets();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [apiPlaylist, setApiPlaylist] = useState<PlaylistApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { playlists, deletePlaylist, renamePlaylist, updatePlaylistDescription } =
    usePlaylists();

  // Load playlist from API
  const loadPlaylistFromApi = useCallback(async () => {
    if (!playlistName) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get all playlists and find the matching one
      const { playlists: userPlaylists } = await playlistService.getUserPlaylists();

      // Find playlist by name (for Liked Songs, it will be playlistType: "liked")
      const foundPlaylist = userPlaylists.find(
        (p) =>
          p.name === playlistName ||
          (playlistName === "Liked Songs" && p.playlistType === "liked")
      );

      if (foundPlaylist) {
        setApiPlaylist(foundPlaylist);
      } else {
        setError("Playlist not found");
      }
    } catch (err) {
      console.error("Error loading playlist:", err);
      setError("Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  }, [playlistName]);

  // Load playlist when component mounts
  useEffect(() => {
    loadPlaylistFromApi();
  }, [loadPlaylistFromApi]);

  // Get playlist data (prioritize API data)
  const playlist = apiPlaylist
    ? convertApiPlaylistToPlaylist(apiPlaylist)
    : playlists.find((playlist) => playlist.name === playlistName);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading playlist...</Text>
      </View>
    );
  }

  // Error state
  if (error && !playlist) {
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
          Error loading playlist
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 16,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadPlaylistFromApi}
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

  if (!playlist) {
    console.warn(`Playlist ${playlistName} was not found!`);
    return <Redirect href={"/(tabs)/playlists"} />;
  }

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 80);
  };

  const handleEditPlaylist = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    // Check if name changed and if new name already exists
    if (editName.trim() !== playlist.name) {
      const existingPlaylist = playlists.find(
        (p) => p.name.toLowerCase() === editName.trim().toLowerCase()
      );

      if (existingPlaylist) {
        Alert.alert("Error", "A playlist with this name already exists");
        return;
      }

      // Rename playlist
      renamePlaylist(playlist.name, editName.trim());
    }

    // Update description
    if (editDescription.trim() !== (playlist.description || "")) {
      updatePlaylistDescription(editName.trim(), editDescription.trim());
    }

    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditName("");
    setEditDescription("");
  };

  const handleDeletePlaylist = () => {
    if (playlist.isDefault) {
      Alert.alert("Cannot Delete", "This playlist cannot be deleted");
      return;
    }

    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePlaylist(playlist.name);
            router.back();
          },
        },
      ]
    );
  };

  const gradientColors = getPlaylistGradient(playlist.name);

  return (
    <View className="flex-1">
      <LinearGradient colors={gradientColors} locations={[0, 0.3]} style={{ flex: 1 }}>
        {/* Sticky Header - Back button, title, and play button when scrolled */}
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
                  fontSize: fontSize.base,
                  fontWeight: "600",
                  color: "#fff",
                  flex: 1,
                  textAlign: "left",
                  marginLeft: 8,
                }}
              >
                {playlist.name}
              </Text>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#3b82f6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="play" size={16} color="white" />
              </TouchableOpacity>
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

              {!playlist.isDefault && (
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity onPress={handleEditPlaylist}>
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeletePlaylist}>
                    <Ionicons
                      name="trash-outline"
                      size={24}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Playlist Title */}
            <Text
              numberOfLines={2}
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {playlist.name}
            </Text>

            {/* Song Count */}
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 24,
              }}
            >
              {playlist.tracks.length} song{playlist.tracks.length !== 1 ? "s" : ""}
            </Text>

            {/* Download and Controls Row */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity>
                <Ionicons
                  name="download-outline"
                  size={24}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>

              <View className="flex-row items-center gap-4">
                <TouchableOpacity>
                  <Ionicons name="shuffle" size={24} color="#3b82f6" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#3b82f6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="play" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Add to Playlist Section */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="add" size={24} color="rgba(255,255,255,0.7)" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: "#fff",
                  fontWeight: "400",
                }}
              >
                Add to this playlist
              </Text>
            </TouchableOpacity>
          </View>

          {/* Songs List with gradient overlay */}
          <LinearGradient
            colors={["transparent", "#000000"]}
            locations={[0, 0.1]}
            style={{ flex: 1 }}
          >
            <PlaylistTracksList
              playlist={playlist}
              hideTitle={true}
              hideControls={true}
            />
          </LinearGradient>

          {/* Recommended Section */}
          {/* <View className="px-4 mt-8" style={{ backgroundColor: "#000000" }}> */}
          {/* <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Recommended for you
            </Text> */}

          {/* Sample recommended item */}
          {/* <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                paddingHorizontal: 12,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  marginRight: 12,
                }}
              />
              <View className="flex-1">
                <Text
                  style={{
                    fontSize: 16,
                    color: "#fff",
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  Lời Tự Trái Tim Anh
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  🎵 Phan Mạnh Quỳnh
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <TouchableOpacity>
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity> */}
          {/* </View> */}
        </ScrollView>
      </LinearGradient>

      {/* Edit Playlist Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showEditModal}
        onRequestClose={handleCancelEdit}
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
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Edit Playlist
            </Text>

            <TouchableOpacity onPress={handleSaveEdit}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#3b82f6",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView className="flex-1 px-4">
              {/* Playlist Image */}
              <View className="items-center mb-8">
                <TouchableOpacity
                  style={{
                    width: 200,
                    height: 200,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="musical-notes"
                    size={80}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#fff",
                      fontWeight: "500",
                    }}
                  >
                    Change image
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Playlist Name Input */}
              <View className="mb-6">
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Playlist name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(255,255,255,0.3)",
                    paddingBottom: 8,
                    textAlign: "center",
                  }}
                  maxLength={50}
                />
              </View>

              {/* Add Description Button or Description Input */}
              {editDescription.length > 0 ? (
                <View className="mb-6">
                  <TextInput
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="Add description"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    multiline
                    style={{
                      fontSize: 16,
                      color: "rgba(255,255,255,0.8)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: 12,
                      minHeight: 80,
                      textAlignVertical: "top",
                    }}
                    maxLength={200}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setEditDescription(" ")}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 25,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    alignSelf: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#fff",
                      fontWeight: "500",
                    }}
                  >
                    Add description
                  </Text>
                </TouchableOpacity>
              )}

              {/* Helper Text */}
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Start adding to your playlist. You&apos;ll be{"\n"}able to edit it here.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default PlaylistScreen;
