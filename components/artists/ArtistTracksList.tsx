import { QueueControls } from "@/components/shared/QueueControls";
import { TracksList } from "@/components/songs/TracksList";
import { unknownArtistImageUri } from "@/constants/images";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { Artist } from "@/helpers/types";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Text, View } from "react-native";

export const ArtistTracksList = ({ artist }: { artist: Artist }) => {
  const search = useNavigationSearch({
    searchBarOptions: {
      hideWhenScrolling: true,
      placeholder: "Find in songs",
    },
  });

  const filteredArtistTracks = useMemo(() => {
    return artist.tracks.filter(trackTitleFilter(search));
  }, [artist.tracks, search]);

  return (
    <TracksList
      id={generateTracksListId(artist.name, search)}
      hideQueueControls={true}
      ListHeaderComponentStyle={{ flex: 1, marginBottom: 32 }}
      scrollEnabled={false}
      ListHeaderComponent={
        <View>
          <View className="flex-row justify-center h-48">
            <Image
              source={{
                uri: unknownArtistImageUri,
              }}
              style={{
                width: "60%",
                height: "100%",
                borderRadius: 999,
              }}
              contentFit="cover"
            />
          </View>

          <Text
            numberOfLines={1}
            className="text-white mt-5 text-center text-2xl font-extrabold"
          >
            {artist.name}
          </Text>

          {search.length === 0 && (
            <QueueControls tracks={filteredArtistTracks} style={{ paddingTop: 24 }} />
          )}
        </View>
      }
      tracks={filteredArtistTracks}
    />
  );
};
