import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";

const PlaylistsScreenLayout = () => {
  return (
    <View className={defaultStyles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="[name]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
};

export default PlaylistsScreenLayout;
