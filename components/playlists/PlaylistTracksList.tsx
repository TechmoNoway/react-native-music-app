import { fontSize } from "@/constants/tokens";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { Playlist } from "@/helpers/types";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { QueueControls } from "../shared/QueueControls";
import { TracksList } from "../songs/TracksList";

export const PlaylistTracksList = ({
  playlist,
  hideTitle = false,
  hideControls = false,
}: {
  playlist: Playlist;
  hideTitle?: boolean;
  hideControls?: boolean;
}) => {
  const search = useNavigationSearch({
    searchBarOptions: {
      hideWhenScrolling: true,
      placeholder: "Find in playlist",
    },
  });

  const filteredPlaylistTracks = useMemo(() => {
    return playlist.tracks.filter(trackTitleFilter(search));
  }, [playlist.tracks, search]);

  // Empty state for custom playlists - Spotify style
  if (playlist.tracks.length === 0 && !playlist.isDefault) {
    return (
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 60,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#fff",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Let&apos;s find something for your playlist
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 24,
          }}
        >
          Search for songs or artists to add to this playlist
        </Text>
      </View>
    );
  }

  return (
    <TracksList
      id={generateTracksListId(playlist.name, search)}
      scrollEnabled={false}
      hideQueueControls={true}
      ListHeaderComponentStyle={{ flex: 1, marginBottom: 0 }}
      ListHeaderComponent={
        <View>
          {!hideTitle && (
            <Text
              numberOfLines={1}
              style={{
                marginTop: 16,
                textAlign: "center",
                fontSize: fontSize.lg,
                fontWeight: "800",
                color: "#fff",
              }}
            >
              {playlist.name}
            </Text>
          )}

          {search.length === 0 && !hideControls && (
            <QueueControls
              style={{
                paddingTop: 20,
              }}
              tracks={playlist.tracks}
            />
          )}
        </View>
      }
      tracks={filteredPlaylistTracks}
      className="px-2"
    />
  );
};
