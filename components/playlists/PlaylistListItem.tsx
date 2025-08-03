import { colors } from "@/constants/tokens";
import { Playlist } from "@/helpers/types";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableHighlight, TouchableHighlightProps, View } from "react-native";

type PlaylistListItemProps = {
  playlist: Playlist;
} & TouchableHighlightProps;

export const PlaylistListItem = ({ playlist, ...props }: PlaylistListItemProps) => {
  return (
    <TouchableHighlight activeOpacity={0.8} {...props}>
      <View className="flex-row gap-3.5 items-center pr-24">
        <View>
          <Image
            source={{
              uri: playlist.artworkPreview,
            }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
            }}
            contentFit="cover"
          />
        </View>

        <View className="flex-row justify-between items-center w-full">
          <Text
            numberOfLines={1}
            style={{
              fontSize: 17,
              fontWeight: "600",
              maxWidth: "80%",
              color: colors.text,
            }}
          >
            {playlist.name}
          </Text>

          <AntDesign
            name="right"
            size={16}
            color={colors.icon}
            style={{ opacity: 0.5 }}
          />
        </View>
      </View>
    </TouchableHighlight>
  );
};
