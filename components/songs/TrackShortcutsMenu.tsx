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
import { useFavorites, useQueue } from "@/store/hooks";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type TrackShortcutsMenuProps = PropsWithChildren<{ track: Track }>;

export const TrackShortcutsMenu = ({ track, children }: TrackShortcutsMenuProps) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Check if current user has liked this song
  const isFavorite = isTrackLiked(track, user?.id);

  const { toggleTrackFavorite } = useFavorites();
  const { activeQueueId } = useQueue();

  const handlePressAction = async (id: string) => {
    setModalVisible(false);

    if (isLoading) return; // Prevent multiple simultaneous actions

    try {
      setIsLoading(true);

      switch (id) {
        case "add-to-favorites":
          try {
            const result = await playlistService.likeSong(track);

            // Update track's likedBy array locally
            if (user?.id && track.likedBy) {
              track.likedBy.push(user.id.toString());
              track.likesCount = result.likesCount;
            }

            toggleTrackFavorite(track); // Update local state

            Alert.alert("Success", getLikeSuccessMessage(false), [{ text: "OK" }]);

            // if the tracks is in the favorite queue, add it
            if (activeQueueId?.startsWith("favorites")) {
              await AudioService.add(track);
            }
          } catch (error) {
            console.error("Error adding to favorites:", error);
            Alert.alert("Error", getLikeErrorMessage(false), [{ text: "OK" }]);
          }
          break;

        case "remove-from-favorites":
          try {
            const result = await playlistService.unlikeSong(track);

            // Update track's likedBy array locally
            if (user?.id && track.likedBy) {
              track.likedBy = track.likedBy.filter((id) => id !== user.id.toString());
              track.likesCount = result.likesCount;
            }

            toggleTrackFavorite(track); // Update local state

            // if the track is in the favorites queue, we need to remove it
            if (activeQueueId?.startsWith("favorites")) {
              const queue = await AudioService.getQueue();

              const trackToRemove = queue.findIndex(
                (queueTrack: Track) => queueTrack.fileUrl === track.fileUrl
              );

              await AudioService.remove(trackToRemove);
            }

            Alert.alert("Success", getLikeSuccessMessage(true), [{ text: "OK" }]);
          } catch (error) {
            console.error("Error removing from favorites:", error);
            Alert.alert("Error", getLikeErrorMessage(true), [{ text: "OK" }]);
          }
          break;

        case "add-to-playlist":
          // it opens the addToPlaylist modal
          router.push({
            pathname: "/(modals)/addToPlaylist",
            params: { trackUrl: track.fileUrl },
          });
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

      {/* Loading overlay for favorites action */}
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
              onPress={() => handlePressAction("add-to-playlist")}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.icon}
                style={{ marginRight: 12 }}
              />
              <Text className="text-white text-base">Add to playlist</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
