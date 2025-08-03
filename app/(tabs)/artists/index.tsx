import { unknownArtistImageUri } from "@/constants/images";
import { colors } from "@/constants/tokens";
import { artistNameFilter } from "@/helpers/filter";
import { useArtists } from "@/store/hooks";
import { defaultStyles, utilsStyles } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ItemSeparatorComponent = () => {
  return <View className={`${utilsStyles.itemSeparator} ml-12 my-3`} />;
};

const ArtistsScreen = () => {
  const [search, setSearch] = useState("");
  const artists = useArtists();
  const { top, bottom } = useSafeAreaInsets();

  const filteredArtists = useMemo(() => {
    if (!search) return artists;

    return artists.filter(artistNameFilter(search));
  }, [artists, search]);

  return (
    <View className={defaultStyles.container}>
      <ScrollView
        className="px-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: top + 10,
        }}
        contentContainerStyle={{
          paddingBottom: Math.max(bottom + 250, 300),
        }}
      >
        {/* Header Section */}
        <View className="pb-5">
          <Text className="text-white text-[32px] font-bold mb-2">Artists</Text>
          <Text className="text-neutral-400 text-base mb-5">
            {artists.length} artist{artists.length !== 1 ? "s" : ""}
          </Text>

          {/* Search Input */}
          <View
            className="flex-row items-center rounded-xl px-4 py-3 mb-5"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <Ionicons name="search" size={20} color={colors.primary} className="mr-3" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find in artists"
              placeholderTextColor={colors.textMuted}
              className="flex-1 text-white text-base"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.primary}
                  className="ml-2"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <FlatList
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 120 }}
          scrollEnabled={false}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListFooterComponent={ItemSeparatorComponent}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-neutral-400 text-base mb-10">No artist found</Text>

              <Image
                source={{
                  uri: unknownArtistImageUri,
                }}
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
          data={filteredArtists}
          renderItem={({ item: artist }) => {
            return (
              <Link href={`/artists/${artist.name}`} asChild>
                <TouchableHighlight activeOpacity={0.8}>
                  <View className="flex-row gap-3.5 items-center">
                    <View>
                      <Image
                        source={{
                          uri: unknownArtistImageUri,
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                        }}
                        contentFit="cover"
                      />
                    </View>

                    <View className="w-full">
                      <Text
                        numberOfLines={1}
                        className="text-white text-[17px] max-w-[80%]"
                      >
                        {artist.name}
                      </Text>
                    </View>
                  </View>
                </TouchableHighlight>
              </Link>
            );
          }}
        />
      </ScrollView>
    </View>
  );
};

export default ArtistsScreen;
