import { colors } from "@/constants/tokens";
import { useDialog } from "@/hooks/useDialog";
import { playlistService } from "@/services/playlistService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

interface Playlist {
  _id: string;
  name: string;
  songs: any[];
  isCreated?: boolean;
}

interface PlaylistSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  trackTitle?: string;
  trackId?: string;
  onAddToPlaylist: (playlistId: string) => void;
  isLoading?: boolean;
}

export const PlaylistSelectorModal: React.FC<PlaylistSelectorModalProps> = ({
  visible,
  onClose,
  trackTitle,
  trackId,
  onAddToPlaylist,
  isLoading: externalLoading = false,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { showAlert } = useDialog();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const loadPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      const { playlists: userPlaylists } = await playlistService.getUserPlaylists({
        type: "custom",
      });
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
      showAlert("Error", "Failed to load playlists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible, loadPlaylists]);

  const handleCreateNewPlaylist = () => {
    setShowCreateModal(true);
  };

  const handleCreatePlaylist = async (name: string) => {
    if (!name.trim()) {
      showAlert("Error", "Please enter a playlist name");
      return;
    }

    if (name.trim().toLowerCase() === "liked songs") {
      showAlert("Error", "This playlist name is reserved");
      return;
    }

    const existingPlaylist = playlists.find(
      (playlist) => playlist.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingPlaylist) {
      showAlert("Error", "A playlist with this name already exists");
      return;
    }

    try {
      setIsCreatingPlaylist(true);

      // Create playlist via API
      const { playlist } = await playlistService.createPlaylist({
        name: name.trim(),
        description: "",
        coverImageUrl: "",
      });

      const newPlaylist: Playlist = {
        _id: playlist._id,
        name: playlist.name,
        songs: [],
        isCreated: true,
      };

      setPlaylists((prev) => [newPlaylist, ...prev]);
      setShowCreateModal(false);
      setNewPlaylistName("");

      // Add track to the new playlist if trackId exists
      if (trackId) {
        onAddToPlaylist(newPlaylist._id);
      }

      onClose();
    } catch (error) {
      console.error("Error creating playlist:", error);
      showAlert("Error", "Failed to create playlist. Please try again.");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewPlaylistName("");
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    if (trackId) {
      const isTrackInPlaylist = playlist.songs.some((song: any) => song._id === trackId);

      if (isTrackInPlaylist) {
        showAlert("Info", "This song is already in the playlist.");
        return;
      }
    }

    onAddToPlaylist(playlist._id);
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "flex-end",
        }}
      >
        {/* Backdrop */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        {/* Bottom Sheet */}
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: bottom + 20,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <View style={{ padding: 20, alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#666",
                borderRadius: 2,
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Add to playlist
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: "#999",
                fontSize: 14,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              {trackTitle || "Unknown Track"}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#333", marginBottom: 8 }} />

          {/* Create New Playlist Button */}
          <TouchableOpacity
            onPress={handleCreateNewPlaylist}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#333",
            }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="add" size={20} color="white" />
            </View>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
              Create new playlist
            </Text>
          </TouchableOpacity>

          {/* Playlists List */}
          {isLoading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: "#999", marginTop: 12 }}>Loading playlists...</Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item._id}
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isTrackInPlaylist = trackId
                  ? item.songs.some((song: any) => song._id === trackId)
                  : false;

                return (
                  <TouchableOpacity
                    onPress={() => handleSelectPlaylist(item)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      opacity: externalLoading || isTrackInPlaylist ? 0.6 : 1,
                    }}
                    activeOpacity={0.7}
                    disabled={externalLoading || isTrackInPlaylist}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        backgroundColor: "#333",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="musical-notes" size={20} color="#999" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "500",
                          marginBottom: 2,
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={{ color: "#999", fontSize: 13 }}>
                        {item.songs.length} songs
                        {isTrackInPlaylist && " • Already added"}
                      </Text>
                    </View>
                    {item.isCreated && (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 11 }}>NEW</Text>
                      </View>
                    )}
                    {isTrackInPlaylist && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                    {externalLoading && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* External loading overlay */}
          {externalLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#1a1a1a",
                  padding: 20,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: "white", marginTop: 12 }}>
                  Adding to playlist...
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        visible={showCreateModal}
        onClose={handleCloseCreateModal}
        onCreatePlaylist={handleCreatePlaylist}
        playlistName={newPlaylistName}
        setPlaylistName={setNewPlaylistName}
        isLoading={isCreatingPlaylist}
      />
    </Modal>
  );
};
