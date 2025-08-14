import { colors } from "@/constants/tokens";
import { useLogTrackPlayerState } from "@/hooks/useLogTrackPlayerState";
import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { store } from "@/store/store";
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

      <Stack.Screen
        name="player"
        options={{
          presentation: "modal",
          gestureEnabled: true,
          gestureDirection: "vertical",
          animationDuration: 300,
          headerShown: false,
          animation: "fade",
          animationTypeForReplace: "pop",
          gestureResponseDistance: {},
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      />

      <Stack.Screen
        name="(modals)/addToPlaylist"
        options={{
          presentation: "modal",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitle: "Add to playlist",
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
    </Stack>
  );
};
