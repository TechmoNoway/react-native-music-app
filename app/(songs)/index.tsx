import { TracksList } from "@/components/TracksList";
import { colors } from "@/constants/tokens";
import { trackTitleFilter } from "@/helpers/filter";
import { generateTracksListId } from "@/helpers/miscellaneous";
import { useTracks } from "@/store/hooks";
import { defaultStyles } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SongsScreen = () => {
  const [search, setSearch] = useState("");
  const tracks = useTracks();
  const { top, bottom } = useSafeAreaInsets();

  const filteredTracks = useMemo(() => {
    if (!search) return tracks;

    return tracks.filter(trackTitleFilter(search));
  }, [search, tracks]);

  return (
    <View className={defaultStyles.container}>
      <ScrollView
        className="px-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: top + 60,
        }}
        contentContainerStyle={{
          paddingBottom: Math.max(bottom + 60, 110), // Account for tab bar + floating player
        }}
      >
        {/* Header Section */}
        <View style={{ paddingTop: 10, paddingBottom: 20 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Songs
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textMuted,
              marginBottom: 20,
            }}
          >
            {tracks.length} song{tracks.length !== 1 ? "s" : ""}
          </Text>

          {/* Search Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.backgroundCard,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find in songs"
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 16,
              }}
            />
            {search ? (
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.primary}
                onPress={() => setSearch("")}
                style={{ marginLeft: 8 }}
              />
            ) : null}
          </View>
        </View>

        <TracksList
          id={generateTracksListId("songs", search)}
          tracks={filteredTracks}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

export default SongsScreen;
