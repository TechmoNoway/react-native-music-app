import { PlaylistsList } from "@/components/playlists/PlaylistsList";
import { Playlist } from "@/helpers/types";
import AudioService from "@/services/audioService";
import { usePlaylists, useQueue, useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Track } from "@/types/audio";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const AddToPlaylistModal = () => {
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const { activeQueueId } = useQueue();

  const { trackUrl } = useLocalSearchParams<{ trackUrl: Track["url"] }>();

  const tracks = useTracks();

  const { playlists, addToPlaylist } = usePlaylists();

  const track = tracks.find((currentTrack) => trackUrl === currentTrack.url);

  // track was not found
  if (!track) {
    return null;
  }

  const availablePlaylists = playlists.filter(
    (playlist) =>
      !playlist.tracks.some((playlistTrack) => playlistTrack.url === track.url)
  );

  const handlePlaylistPress = async (playlist: Playlist) => {
    addToPlaylist(track, playlist.name);

    // should close the modal
    router.dismiss();

    // if the current queue is the playlist we're adding to, add the track at the end of the queue
    if (activeQueueId?.startsWith(playlist.name)) {
      await AudioService.add(track);
    }
  };

  return (
    <SafeAreaView
      className={`${defaultStyles.container} px-6`}
      style={{ paddingTop: headerHeight }}
    >
      <PlaylistsList
        playlists={availablePlaylists}
        onPlaylistPress={handlePlaylistPress}
      />
    </SafeAreaView>
  );
};

export default AddToPlaylistModal;
