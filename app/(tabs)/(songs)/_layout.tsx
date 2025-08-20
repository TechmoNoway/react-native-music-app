import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";

const SongsScreenLayout = () => {
  return (
    <View className={defaultStyles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="genre/[genre]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
};

export default SongsScreenLayout;
