import { PlaylistSelectorModal } from "@/components/shared/PlaylistSelectorModal";
import { colors } from "@/constants/tokens";
import {
  getLikeActionText,
  getLikeErrorMessage,
  getLikeLoadingMessage,
  getLikeSuccessMessage,
  isTrackLiked,
} from "@/helpers/trackHelpers";
import { useUser } from "@/hooks/useUser";
import AudioService from "@/services/audioService";
import { playlistService } from "@/services/playlistService";
import { useApiPlaylists, useFavorites, useQueue } from "@/store/hooks";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TrackShortcutsMenuProps = PropsWithChildren<{
  track: Track;
  context?: {
    type: "playlist";
    playlistId: string;
  };
  onSongRemoved?: () => void;
}>;

export const TrackShortcutsMenu = ({
  track,
  children,
  context,
  onSongRemoved,
}: TrackShortcutsMenuProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistSelectorVisible, setPlaylistSelectorVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
  const { user } = useUser();
  const { removeSongFromPlaylist } = useApiPlaylists();

  const getUserId = () => {
    const hardcodedUserId = "689c790732d9912b9f9347b2";

    if (!user) {
      return hardcodedUserId;
    }

    const userId = user.id || (user as any)._id;
    return userId || hardcodedUserId;
  };

  const currentUserId = getUserId();

  const isFavorite = isTrackLiked(track, currentUserId);

  const { toggleTrackFavorite } = useFavorites();
  const { activeQueueId } = useQueue();

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setIsPlaylistLoading(true);

      await playlistService.addSongToPlaylist(playlistId, {
        songId: track._id,
      });

      // Close the playlist selector modal
      setPlaylistSelectorVisible(false);
      Alert.alert("Success", "Song added to playlist successfully!", [{ text: "OK" }]);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      Alert.alert("Error", "Failed to add song to playlist. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsPlaylistLoading(false);
    }
  };

  const handlePressAction = async (id: string) => {
    setModalVisible(false);

    if (isLoading) return;

    try {
      setIsLoading(true);

      switch (id) {
        case "add-to-favorites":
          try {
            if (currentUserId && track.likedBy) {
              track.likedBy.push(currentUserId.toString());
              track.likesCount = (track.likesCount || 0) + 1;
            }

            const result = await playlistService.likeSong(track);

            if (result.likesCount !== undefined) {
              track.likesCount = result.likesCount;
            }

            toggleTrackFavorite(track);

            Alert.alert("Success", getLikeSuccessMessage(true), [{ text: "OK" }]);

            if (activeQueueId?.startsWith("favorites")) {
              await AudioService.add(track);
            }

            onSongRemoved?.();
          } catch (error) {
            console.error("Error adding to favorites:", error);

            if (currentUserId && track.likedBy) {
              track.likedBy = track.likedBy.filter(
                (id) => id !== currentUserId.toString()
              );
              track.likesCount = Math.max(0, (track.likesCount || 1) - 1);
            }

            Alert.alert("Error", getLikeErrorMessage(true), [{ text: "OK" }]);
          }
          break;

        case "remove-from-favorites":
          try {
            if (currentUserId && track.likedBy) {
              track.likedBy = track.likedBy.filter(
                (id) => id !== currentUserId.toString()
              );
              track.likesCount = Math.max(0, (track.likesCount || 1) - 1);
            }

            const result = await playlistService.unlikeSong(track);

            if (result.likesCount !== undefined) {
              track.likesCount = result.likesCount;
            }

            toggleTrackFavorite(track);

            if (activeQueueId?.startsWith("favorites")) {
              const queue = await AudioService.getQueue();

              const trackToRemove = queue.findIndex(
                (queueTrack: Track) => queueTrack.fileUrl === track.fileUrl
              );

              await AudioService.remove(trackToRemove);
            }

            Alert.alert("Success", getLikeSuccessMessage(false), [{ text: "OK" }]);

            onSongRemoved?.();
          } catch (error) {
            console.error("Error removing from favorites:", error);

            if (currentUserId && track.likedBy) {
              track.likedBy.push(currentUserId.toString());
              track.likesCount = (track.likesCount || 0) + 1;
            }

            Alert.alert("Error", getLikeErrorMessage(false), [{ text: "OK" }]);
          }
          break;

        case "add-to-playlist":
          setModalVisible(false);
          setPlaylistSelectorVisible(true);
          setIsLoading(false);
          return;

        case "remove-from-playlist":
          if (context?.type === "playlist" && context.playlistId) {
            try {
              await removeSongFromPlaylist(context.playlistId, track._id);
              Alert.alert("Success", "Song removed from playlist", [{ text: "OK" }]);
              onSongRemoved?.();
            } catch (error) {
              console.error("Error removing song from playlist:", error);
              Alert.alert("Error", "Failed to remove song from playlist", [
                { text: "OK" },
              ]);
            }
          }
          break;

        default:
          console.warn(`Unknown menu action ${id}`);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        {children}
      </TouchableOpacity>

      {/* Loading overlay for favorites action only */}
      {isLoading && (
        <Modal animationType="fade" transparent={true} visible={isLoading}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                padding: 24,
                borderRadius: 12,
                alignItems: "center",
                minWidth: 150,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: 12, textAlign: "center" }}>
                {getLikeLoadingMessage(isFavorite)}
              </Text>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-neutral-900 rounded-lg p-4 m-4 min-w-[250px]">
            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg"
              onPress={() =>
                handlePressAction(
                  isFavorite ? "remove-from-favorites" : "add-to-favorites"
                )
              }
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={colors.icon}
                style={{ marginRight: 12 }}
              />
              <Text className="text-white text-base">
                {getLikeActionText(isFavorite)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg mt-2"
              onPress={() =>
                handlePressAction(
                  context?.type === "playlist"
                    ? "remove-from-playlist"
                    : "add-to-playlist"
                )
              }
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              <Ionicons
                name={
                  context?.type === "playlist"
                    ? "remove-circle-outline"
                    : "add-circle-outline"
                }
                size={20}
                color={colors.icon}
                style={{ marginRight: 12 }}
              />
              <Text className="text-white text-base">
                {context?.type === "playlist" ? "Remove this song" : "Add to playlist"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <PlaylistSelectorModal
        visible={playlistSelectorVisible}
        onClose={() => setPlaylistSelectorVisible(false)}
        trackTitle={track.title}
        trackId={track._id}
        onAddToPlaylist={handleAddToPlaylist}
        isLoading={isPlaylistLoading}
      />
    </>
  );
};
