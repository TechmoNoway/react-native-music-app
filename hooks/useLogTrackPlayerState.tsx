import { Event, useTrackPlayerEvents } from "@/services/audioService";

const events = [
  Event.PlaybackState,
  Event.PlaybackError,
  Event.PlaybackActiveTrackChanged,
];

export const useLogTrackPlayerState = () => {
  useTrackPlayerEvents(
    events,
    async (event: { type: string; state: any; index: any }) => {
      if (event.type === Event.PlaybackError) {
        console.warn("An error occurred: ", event);
      }

      if (event.type === Event.PlaybackState) {
        console.log("Playback state: ", event.state);
      }

      if (event.type === Event.PlaybackActiveTrackChanged) {
        console.log("Track changed", event.index);
      }
    }
  );
};
