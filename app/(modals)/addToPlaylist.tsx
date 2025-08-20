import { PlaylistSelector } from "@/components/playlists/PlaylistSelector";
import { colors } from "@/constants/tokens";
import { playlistService } from "@/services/playlistService";
import { useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { PlaylistApiResponse } from "@/types/api";
import { Track } from "@/types/audio";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddToPlaylistModal = () => {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const [isLoading, setIsLoading] = useState(false);
  const [addingPlaylistName, setAddingPlaylistName] = useState<string>("");

  const { trackUrl } = useLocalSearchParams<{ trackUrl: Track["fileUrl"] }>();

  const tracks = useTracks();

  const track = tracks.find((currentTrack) => trackUrl === currentTrack.fileUrl);

  // track was not found
  if (!track) {
    return null;
  }

  const handlePlaylistPress = async (playlist: PlaylistApiResponse) => {
    if (isLoading) return; // Prevent multiple clicks

    // Check if track is already in the playlist
    const isTrackInPlaylist = playlist.songs.some((song) => song._id === track._id);

    if (isTrackInPlaylist) {
      Alert.alert("Info", "This song is already in the playlist.", [{ text: "OK" }]);
      return;
    }

    try {
      setIsLoading(true);
      setAddingPlaylistName(playlist.name);

      // Call API to add song to playlist
      await playlistService.addSongToPlaylist(playlist._id, {
        songId: track._id,
      });

      // Show success message briefly before dismissing
      setTimeout(() => {
        router.dismiss();
      }, 1000); // Wait 1 second to show success state
    } catch (error) {
      console.error("Error adding to playlist:", error);
      Alert.alert("Error", "Failed to add song to playlist. Please try again.", [
        { text: "OK" },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`${defaultStyles.container} px-6`}
      style={{ paddingTop: headerHeight }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: "white", marginTop: 10 }}>Adding to playlist...</Text>
        </View>
      )}

      <PlaylistSelector
        track={track}
        onPlaylistSelect={handlePlaylistPress}
        onClose={() => router.dismiss()}
        isAddingToPlaylist={isLoading}
        addingPlaylistName={addingPlaylistName}
      />
    </SafeAreaView>
  );
};

export default AddToPlaylistModal;
