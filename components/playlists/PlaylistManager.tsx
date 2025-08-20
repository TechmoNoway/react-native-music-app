import { useApiPlaylists } from "@/store/hooks";
import { Track } from "@/types/audio";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

interface PlaylistManagerProps {
  track?: Track; // Optional track to add to playlists
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ track }) => {
  const {
    apiPlaylists,
    loading,
    error,
    fetchPlaylists,
    createPlaylist,
    addSongToPlaylist,
    toggleFavorite,
  } = useApiPlaylists();

  const [playlistName, setPlaylistName] = useState("");

  useEffect(() => {
    // Fetch user playlists when component mounts
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    try {
      await createPlaylist({ name: playlistName });
      setPlaylistName("");
      Alert.alert("Success", "Playlist created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create playlist");
      console.error("Failed to create playlist:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    if (!track) {
      Alert.alert("Error", "No track selected");
      return;
    }

    try {
      await addSongToPlaylist(playlistId, track._id);
      Alert.alert("Success", `Added to ${playlistName}!`);
    } catch (error) {
      Alert.alert("Error", `Failed to add to ${playlistName}`);
      console.error("Failed to add to playlist:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!track) {
      Alert.alert("Error", "No track selected");
      return;
    }

    try {
      await toggleFavorite(track);
      Alert.alert("Success", "Added to Liked Songs!");
    } catch (error) {
      Alert.alert("Error", "Failed to add to favorites");
      console.error("Failed to toggle favorite:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading playlists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
        <TouchableOpacity
          onPress={() => fetchPlaylists()}
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Playlist Manager
      </Text>

      {/* Create new playlist section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Create New Playlist</Text>
        <TouchableOpacity
          onPress={handleCreatePlaylist}
          style={{
            backgroundColor: "#28a745",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Create Playlist: {playlistName || "New Playlist"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add to favorites */}
      {track && (
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={{
              backgroundColor: "#dc3545",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              ❤️ Add {track.title} to Liked Songs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User playlists list */}
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Your Playlists ({apiPlaylists.length})
      </Text>
      {apiPlaylists.map((playlist) => (
        <View
          key={playlist.name}
          style={{
            backgroundColor: "#f8f9fa",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontWeight: "bold" }}>{playlist.name}</Text>
            <Text style={{ color: "#6c757d" }}>{playlist.tracks.length} songs</Text>
            {playlist.description && (
              <Text style={{ color: "#6c757d", fontSize: 12 }}>
                {playlist.description}
              </Text>
            )}
          </View>

          {track && (
            <TouchableOpacity
              onPress={() => handleAddToPlaylist("playlist_id_here", playlist.name)}
              style={{
                backgroundColor: "#007AFF",
                padding: 8,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white", fontSize: 12 }}>Add Song</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {apiPlaylists.length === 0 && (
        <Text style={{ textAlign: "center", color: "#6c757d" }}>
          No playlists found. Create your first playlist!
        </Text>
      )}
    </View>
  );
};
