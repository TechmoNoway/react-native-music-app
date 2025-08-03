import { PlaylistItem } from "@/components/playlists/PlaylistItem";
import { unknownTrackImageUri } from "@/constants/images";
import { playlistNameFilter } from "@/helpers/filter";
import { Playlist } from "@/helpers/types";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { Image } from "expo-image";
import { useMemo } from "react";
import { FlatList, FlatListProps, Text, View } from "react-native";

type PlaylistsListProps = {
  playlists: Playlist[];
  onPlaylistPress: (playlist: Playlist) => void;
} & Partial<FlatListProps<Playlist>>;

export const PlaylistsList = ({
  playlists,
  onPlaylistPress: handlePlaylistPress,
  ...flatListProps
}: PlaylistsListProps) => {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: "Find in playlist",
    },
  });

  const filteredPlaylist = useMemo(() => {
    return playlists.filter(playlistNameFilter(search));
  }, [playlists, search]);

  return (
    <FlatList
      contentContainerClassName="pt-2 pb-32"
      ListEmptyComponent={
        <View>
          <Text className="text-gray-400 text-base text-center mt-5">
            No playlist found
          </Text>

          <Image
            source={{ uri: unknownTrackImageUri }}
            className="w-50 h-50 self-center mt-10 opacity-30"
          />
        </View>
      }
      data={filteredPlaylist}
      renderItem={({ item: playlist }) => (
        <PlaylistItem playlist={playlist} onPress={() => handlePlaylistPress(playlist)} />
      )}
      {...flatListProps}
    />
  );
};
