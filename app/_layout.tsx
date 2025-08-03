import { colors } from "@/constants/tokens";
import { useLogTrackPlayerState } from "@/hooks/useLogTrackPlayerState";
import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { store } from "@/store";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const handleTrackPlayerLoaded = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView className="flex-1 bg-black">
          <RootNavigation />
          <StatusBar style="light" backgroundColor={colors.background} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const RootNavigation = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};
