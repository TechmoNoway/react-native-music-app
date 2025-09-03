import { PlaylistsList } from "@/components/playlists/PlaylistsList";
import { CreatePlaylistModal } from "@/components/shared/CreatePlaylistModal";
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
  const [isCreating, setIsCreating] = useState(false);
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

  const handleCreatePlaylist = async (name: string) => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    if (name.trim().toLowerCase() === "liked songs") {
      Alert.alert("Error", "This playlist name is reserved");
      return;
    }

    const existingPlaylist = combinedPlaylists.find(
      (playlist) => playlist.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingPlaylist) {
      Alert.alert("Error", "A playlist with this name already exists");
      return;
    }

    try {
      setIsCreating(true);
      await createApiPlaylist({
        name: name.trim(),
        description: "",
        coverImageUrl: "",
      });

      setShowCreateDialog(false);
      setNewPlaylistName("");

      onRefresh();

      setTimeout(() => {
        router.push(`/(tabs)/playlists/${name.trim()}`);
      }, 100);
    } catch {
      Alert.alert("Error", "Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
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
      <CreatePlaylistModal
        visible={showCreateDialog}
        onClose={handleCancelCreate}
        onCreatePlaylist={handleCreatePlaylist}
        playlistName={newPlaylistName}
        setPlaylistName={setNewPlaylistName}
        isLoading={isCreating}
      />
    </View>
  );
};

export default PlaylistsScreen;
