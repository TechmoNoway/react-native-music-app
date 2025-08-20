import { ArtistTracksList } from "@/components/artists/ArtistTracksList";
import { useArtists } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Redirect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ArtistDetailScreen = () => {
  const { name: artistName } = useLocalSearchParams<{ name: string }>();
  const { bottom } = useSafeAreaInsets();

  const artists = useArtists();

  const artist = artists.find((artist) => artist.name === artistName);

  if (!artist) {
    console.warn(`Artist ${artistName} not found!`);

    return <Redirect href={"/(tabs)/artists"} />;
  }

  return (
    <View className={defaultStyles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="px-6"
        contentContainerStyle={{
          paddingBottom: Math.max(bottom + 40, 30),
        }}
      >
        <ArtistTracksList artist={artist} />
      </ScrollView>
    </View>
  );
};

export default ArtistDetailScreen;
