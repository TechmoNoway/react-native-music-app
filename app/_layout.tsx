import { colors } from "@/constants/tokens";
import { useLogTrackPlayerState } from "@/hooks/useLogTrackPlayerState";
import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { useUser } from "@/hooks/useUser";
import { store, useAppDispatch, useAppSelector } from "@/store/store";
import { login } from "@/store/userSlice";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
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
          <PaperProvider>
            <RootNavigation />
            <StatusBar style="light" backgroundColor={colors.background} />
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const RootNavigation = () => {
  const { isAuthenticated } = useAppSelector((state: any) => state.user);
  const dispatch = useAppDispatch();
  const { user, loadUser } = useUser();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated) {
        await loadUser();
      }
    };

    initializeAuth();
  }, [loadUser, isAuthenticated]);

  useEffect(() => {
    if (user && !isAuthenticated) {
      dispatch(login(user));
    }
  }, [user, isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <Stack
        initialRouteName="login"
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
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
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
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
