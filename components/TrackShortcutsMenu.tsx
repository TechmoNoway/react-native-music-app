import { colors } from "@/constants/tokens";
import AudioService from "@/services/audioService";
import { useFavorites, useQueue } from "@/store/hooks";
import { Track } from "@/types/audio";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PropsWithChildren, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type TrackShortcutsMenuProps = PropsWithChildren<{ track: Track }>;

export const TrackShortcutsMenu = ({ track, children }: TrackShortcutsMenuProps) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const isFavorite = track.rating === 1;

  const { toggleTrackFavorite } = useFavorites();
  const { activeQueueId } = useQueue();

  const handlePressAction = async (id: string) => {
    setModalVisible(false);

    switch (id) {
      case "add-to-favorites":
        toggleTrackFavorite(track);

        // if the tracks is in the favorite queue, add it
        if (activeQueueId?.startsWith("favorites")) {
          await AudioService.add(track);
        }
        break;

      case "remove-from-favorites":
        toggleTrackFavorite(track);

        // if the track is in the favorites queue, we need to remove it
        if (activeQueueId?.startsWith("favorites")) {
          const queue = await AudioService.getQueue();

          const trackToRemove = queue.findIndex(
            (queueTrack: Track) => queueTrack.url === track.url
          );

          await AudioService.remove(trackToRemove);
        }
        break;

      case "add-to-playlist":
        // it opens the addToPlaylist modal
        router.push({
          pathname: "/(modals)/addToPlaylist",
          params: { trackUrl: track.url },
        });
        break;

      default:
        console.warn(`Unknown menu action ${id}`);
        break;
    }
  };

  return (
    <>
      <TouchableOpacity onLongPress={() => setModalVisible(true)}>
        {children}
      </TouchableOpacity>

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
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={colors.icon}
                style={{ marginRight: 12 }}
              />
              <Text className="text-white text-base">
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg mt-2"
              onPress={() => handlePressAction("add-to-playlist")}
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
