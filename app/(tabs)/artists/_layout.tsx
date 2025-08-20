import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";

const ArtistsScreenLayout = () => {
  return (
    <View className={defaultStyles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            // headerTitle: "",
            // headerLargeTitle: false,
            // headerStyle: {
            //   backgroundColor: colors.background,
            // },
            // headerTintColor: colors.text,
            // headerTransparent: true,
            // headerBlurEffect: "prominent",
            // headerShadowVisible: false,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="[name]"
          options={{
            // headerTitle: "",
            // headerBackVisible: true,
            // headerStyle: {
            //   backgroundColor: colors.background,
            // },
            // headerTintColor: colors.primary,
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
};

export default ArtistsScreenLayout;
