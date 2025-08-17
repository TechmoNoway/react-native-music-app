import { PlaylistsList } from "@/components/playlists/PlaylistsList";
import { colors } from "@/constants/tokens";
import { playlistNameFilter } from "@/helpers/filter";
import { Playlist } from "@/helpers/types";
import { usePlaylists } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
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

const PlaylistsScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const { playlists, createPlaylist } = usePlaylists();
  const { top, bottom } = useSafeAreaInsets();

  // Track khi screen được focus/unfocus
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  const filteredPlaylists = useMemo(() => {
    return playlists.filter(playlistNameFilter(search));
  }, [playlists, search]);

  const handlePlaylistPress = (playlist: Playlist) => {
    router.push(`/(tabs)/playlists/${playlist.name}`);
  };

  const handleCreateNewPlaylist = () => {
    setShowCreateDialog(true);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    // Prevent creating "Liked Songs" playlist manually
    if (newPlaylistName.trim().toLowerCase() === "liked songs") {
      Alert.alert("Error", "This playlist name is reserved");
      return;
    }

    // Check if playlist already exists
    const existingPlaylist = playlists.find(
      (playlist) => playlist.name.toLowerCase() === newPlaylistName.trim().toLowerCase()
    );

    if (existingPlaylist) {
      Alert.alert("Error", "A playlist with this name already exists");
      return;
    }

    // Create the playlist
    createPlaylist(newPlaylistName.trim());

    setShowCreateDialog(false);
    setNewPlaylistName("");

    // Navigate to the new playlist
    setTimeout(() => {
      router.push(`/(tabs)/playlists/${newPlaylistName.trim()}`);
    }, 100);
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    setNewPlaylistName("");
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
          paddingBottom: Math.max(bottom + 250, 300),
        }}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center pb-5">
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-[32px] font-bold">Playlists</Text>
              <TouchableOpacity onPress={handleCreateNewPlaylist}>
                <Ionicons name="add" size={28} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text className="text-neutral-400 text-base mt-2">
              {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Search Input - chỉ hiện khi screen đang focus */}
        {isScreenFocused && (
          <View
            className="flex-row items-center rounded-xl px-4 py-3 mb-5"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <Ionicons name="search" size={20} color={colors.primary} className="mr-3" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find in playlists"
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
        )}

        {/* Empty State */}
        {playlists.length === 0 && !search && (
          <View className="flex-1 justify-center items-center mt-20 py-15">
            <Ionicons
              name="folder-outline"
              size={80}
              color={colors.textMuted}
              className="mb-5"
            />
            <Text className="text-white text-xl font-semibold mb-2">
              No playlists yet
            </Text>
            <Text className="text-neutral-400 text-base text-center leading-6">
              Tap the + button to create your{"\n"}first playlist.
            </Text>
          </View>
        )}

        {/* Playlists List */}
        {playlists.length > 0 && (
          <PlaylistsList
            scrollEnabled={false}
            playlists={filteredPlaylists}
            onPlaylistPress={handlePlaylistPress}
          />
        )}
      </ScrollView>

      {/* Create Playlist Dialog */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCreateDialog}
        onRequestClose={handleCancelCreate}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 bg-black/50 justify-center p-5">
            <View className="bg-neutral-900 rounded-2xl p-6 shadow-lg">
              {/* Header */}
              <View className="flex-row items-center mb-6">
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={colors.primary}
                  className="mr-3"
                />
                <Text className="text-white text-xl font-bold flex-1">
                  Create New Playlist
                </Text>
                <TouchableOpacity onPress={handleCancelCreate}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Input Field */}
              <View className="mb-6">
                <Text className="text-white text-base font-semibold mb-2">
                  Playlist Name
                </Text>
                <TextInput
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="Enter playlist name..."
                  placeholderTextColor={colors.textMuted}
                  className={`bg-neutral-800 rounded-xl px-4 py-3 text-white text-base border-2 ${
                    newPlaylistName ? "border-blue-500" : "border-transparent"
                  }`}
                  autoFocus
                  maxLength={50}
                />
                <Text className="text-neutral-400 text-xs mt-1">
                  {newPlaylistName.length}/50 characters
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancelCreate}
                  className="flex-1 bg-neutral-800 rounded-xl py-3.5 items-center"
                >
                  <Text className="text-neutral-400 text-base font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className={`flex-1 rounded-xl py-3.5 items-center ${
                    newPlaylistName.trim() ? "bg-blue-500" : "bg-neutral-800"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      newPlaylistName.trim() ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default PlaylistsScreen;
