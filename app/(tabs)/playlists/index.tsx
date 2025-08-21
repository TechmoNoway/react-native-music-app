import { PlaylistsList } from "@/components/playlists/PlaylistsList";
import { colors } from "@/constants/tokens";
import { playlistNameFilter } from "@/helpers/filter";
import { Playlist, convertApiPlaylistToPlaylist } from "@/helpers/types";
import { playlistService } from "@/services/playlistService";
import { useApiPlaylists, usePlaylists } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { PlaylistApiResponse } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
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
  const [apiPlaylists, setApiPlaylists] = useState<PlaylistApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { playlists } = usePlaylists();
  const { createPlaylist: createApiPlaylist } = useApiPlaylists();
  const { top, bottom } = useSafeAreaInsets();

  const loadApiPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { playlists: userPlaylists } = await playlistService.getUserPlaylists();
      setApiPlaylists(userPlaylists);
    } catch (err) {
      console.error("Error loading playlists:", err);
      setError("Failed to load playlists");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadApiPlaylists();
    setIsRefreshing(false);
  }, [loadApiPlaylists]);

  useEffect(() => {
    loadApiPlaylists();
  }, [loadApiPlaylists]);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      loadApiPlaylists();
      return () => setIsScreenFocused(false);
    }, [loadApiPlaylists])
  );

  const combinedPlaylists = useMemo(() => {
    const convertedApiPlaylists = apiPlaylists.map(convertApiPlaylistToPlaylist);

    if (convertedApiPlaylists.length > 0) {
      return convertedApiPlaylists;
    }

    return playlists;
  }, [apiPlaylists, playlists]);

  const filteredPlaylists = useMemo(() => {
    return combinedPlaylists.filter(playlistNameFilter(search));
  }, [combinedPlaylists, search]);

  const handlePlaylistPress = (playlist: Playlist) => {
    router.push(`/(tabs)/playlists/${playlist.name}`);
  };

  const handleCreateNewPlaylist = () => {
    setShowCreateDialog(true);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    if (newPlaylistName.trim().toLowerCase() === "liked songs") {
      Alert.alert("Error", "This playlist name is reserved");
      return;
    }

    const existingPlaylist = combinedPlaylists.find(
      (playlist) => playlist.name.toLowerCase() === newPlaylistName.trim().toLowerCase()
    );

    if (existingPlaylist) {
      Alert.alert("Error", "A playlist with this name already exists");
      return;
    }

    try {
      // Create the playlist using the API
      await createApiPlaylist({
        name: newPlaylistName.trim(),
        description: "",
        coverImageUrl: "",
      });

      setShowCreateDialog(false);
      setNewPlaylistName("");

      // Refresh playlists to show the new one
      onRefresh();

      // Navigate to the new playlist
      setTimeout(() => {
        router.push(`/(tabs)/playlists/${newPlaylistName.trim()}`);
      }, 100);
    } catch {
      Alert.alert("Error", "Failed to create playlist. Please try again.");
    }
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
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
              {combinedPlaylists.length} playlist
              {combinedPlaylists.length !== 1 ? "s" : ""}
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

        {/* Loading State */}
        {isLoading && !isRefreshing && (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-neutral-400 text-base mt-4">Loading playlists...</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && combinedPlaylists.length === 0 && !search && (
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

        {/* Error State */}
        {error && !isLoading && (
          <View className="flex-1 justify-center items-center mt-20 py-15">
            <Ionicons
              name="alert-circle-outline"
              size={80}
              color={colors.textMuted}
              className="mb-5"
            />
            <Text className="text-white text-xl font-semibold mb-2">
              Error loading playlists
            </Text>
            <Text className="text-neutral-400 text-base text-center leading-6 mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadApiPlaylists}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Playlists List */}
        {!isLoading && combinedPlaylists.length > 0 && (
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
