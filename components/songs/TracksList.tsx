import { QueueControls } from "@/components/shared/QueueControls";
import { TracksListItem } from "@/components/songs/TracksListItem";
import AudioService from "@/services/audioService";
import { useQueue } from "@/store/hooks";
import { Track } from "@/types/audio";
import { useCallback, useRef, useState } from "react";
import { Alert, FlatList, FlatListProps, Text, View } from "react-native";

export type TracksListProps = Partial<FlatListProps<Track>> & {
  id: string;
  tracks: Track[];
  hideQueueControls?: boolean;
  // Add context prop for playlist context
  context?: {
    type: "playlist";
    playlistId: string;
  };
  // Callback for when song is removed from playlist
  onSongRemoved?: () => void;
};

const ItemDivider = () => <View style={{ height: 4 }} />;

export const TracksList = ({
  id,
  tracks,
  hideQueueControls = false,
  context,
  onSongRemoved,
  ...flatlistProps
}: TracksListProps) => {
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();

  const [isProcessing, setIsProcessing] = useState(false);
  const lastTapTime = useRef(0);
  const processingRef = useRef(false);

  const handleTrackSelect = useCallback(
    async (selectedTrack: Track) => {
      const now = Date.now();

      if (now - lastTapTime.current < 800) {
        return;
      }

      if (isProcessing || processingRef.current) {
        return;
      }

      lastTapTime.current = now;
      setIsProcessing(true);
      processingRef.current = true;

      try {
        if (!selectedTrack.fileUrl || selectedTrack.fileUrl.trim() === "") {
          Alert.alert(
            "Cannot Play Track",
            `"${selectedTrack.title}" is not available for playback. This track does not have an audio file.`,
            [{ text: "OK" }]
          );
          return;
        }

        const trackIndex = tracks.findIndex(
          (track) => track.fileUrl === selectedTrack.fileUrl
        );

        if (trackIndex === -1) {
          return;
        }

        const isChangingQueue = id !== activeQueueId;

        if (isChangingQueue) {
          const beforeTracks = tracks.slice(0, trackIndex);
          const afterTracks = tracks.slice(trackIndex + 1);

          await AudioService.reset();

          await AudioService.add(selectedTrack);
          await AudioService.add(afterTracks);
          await AudioService.add(beforeTracks);

          await new Promise((resolve) => setTimeout(resolve, 300));

          await AudioService.play();

          queueOffset.current = trackIndex;
          setActiveQueueId(id);
        } else {
          const nextTrackIndex =
            trackIndex - queueOffset.current < 0
              ? tracks.length + trackIndex - queueOffset.current
              : trackIndex - queueOffset.current;

          await AudioService.skip(nextTrackIndex);
          await AudioService.play();
        }
      } catch (error) {
        console.error("Error in handleTrackSelect:", error);
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          processingRef.current = false;
        }, 1000);
      }
    },
    [tracks, id, activeQueueId, isProcessing, setActiveQueueId]
  );

  return (
    <FlatList
      data={tracks}
      contentContainerClassName="pb-32"
      ListHeaderComponent={
        !hideQueueControls ? (
          <QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
        ) : undefined
      }
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View className="px-4 py-32">
          <Text className="text-gray-400 text-base text-center">No songs found</Text>
        </View>
      }
      renderItem={({ item: track }) => (
        <TracksListItem
          track={track}
          onTrackSelect={isProcessing ? () => {} : handleTrackSelect}
          context={context}
          onSongRemoved={onSongRemoved}
        />
      )}
      {...flatlistProps}
    />
  );
};
