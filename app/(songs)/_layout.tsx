import { colors } from "@/constants/tokens";
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
            headerTitle: "",
            headerLargeTitle: false,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTransparent: true,
            headerBlurEffect: "prominent",
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </View>
  );
};

export default SongsScreenLayout;
