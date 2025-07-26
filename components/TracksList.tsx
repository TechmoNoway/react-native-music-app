import { unknownTrackImageUri } from "@/constants/images";
import AudioService from "@/services/audioService";
import { useQueue } from "@/store/hooks";
import { Track } from "@/types/audio";
import { Image } from "expo-image";
import { useRef } from "react";
import { FlatList, FlatListProps, Text, View } from "react-native";
import { QueueControls } from "./QueueControls";
import { TracksListItem } from "./TracksListItem";

export type TracksListProps = Partial<FlatListProps<Track>> & {
  id: string;
  tracks: Track[];
  hideQueueControls?: boolean;
};

const ItemDivider = () => (
  <View className="border-b border-gray-600 opacity-30 my-2 ml-15" />
);

export const TracksList = ({
  id,
  tracks,
  hideQueueControls = false,
  ...flatlistProps
}: TracksListProps) => {
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();

  const handleTrackSelect = async (selectedTrack: Track) => {
    const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url);

    if (trackIndex === -1) return;

    const isChangingQueue = id !== activeQueueId;

    if (isChangingQueue) {
      const beforeTracks = tracks.slice(0, trackIndex);
      const afterTracks = tracks.slice(trackIndex + 1);

      await AudioService.reset();

      await AudioService.add(selectedTrack);
      await AudioService.add(afterTracks);
      await AudioService.add(beforeTracks);

      // Small delay to ensure track is fully loaded before playing
      await new Promise((resolve) => setTimeout(resolve, 150));
      await AudioService.play();

      queueOffset.current = trackIndex;
      setActiveQueueId(id);
    } else {
      const nextTrackIndex =
        trackIndex - queueOffset.current < 0
          ? tracks.length + trackIndex - queueOffset.current
          : trackIndex - queueOffset.current;

      await AudioService.skip(nextTrackIndex);
      AudioService.play();
    }
  };

  return (
    <FlatList
      data={tracks}
      contentContainerClassName="pt-2.5 pb-32"
      ListHeaderComponent={
        !hideQueueControls ? (
          <QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
        ) : undefined
      }
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View>
          <Text className="text-gray-400 text-base text-center mt-5">No songs found</Text>

          <Image
            source={{ uri: unknownTrackImageUri }}
            style={{
              width: 200,
              height: 200,
              alignSelf: "center",
              marginTop: 40,
              opacity: 0.3,
            }}
            contentFit="cover"
          />
        </View>
      }
      renderItem={({ item: track }) => (
        <TracksListItem track={track} onTrackSelect={handleTrackSelect} />
      )}
      {...flatlistProps}
    />
  );
};
