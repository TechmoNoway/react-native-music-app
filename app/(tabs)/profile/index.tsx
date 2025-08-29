import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../../constants/tokens";

const profileSections = [
  {
    title: "Account",
    items: [
      { icon: "person-outline", label: "Edit Profile", action: "navigate" },
      // { icon: "card-outline", label: "Subscription", action: "navigate" },
      // { icon: "download-outline", label: "Downloads", action: "navigate" },
    ],
  },
  {
    title: "Preferences",
    items: [{ icon: "moon-outline", label: "Dark Mode", action: "toggle" }],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help & FAQ", action: "navigate" },
      { icon: "chatbubble-outline", label: "Contact Us", action: "navigate" },
      // { icon: "star-outline", label: "Rate App", action: "navigate" },
    ],
  },
];

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();
  const { user, logout } = useUser();
  const { profileData, isLoading: isLoadingProfile, fetchProfile } = useUserProfile();

  console.log("ProfileScreen render - user:", user);
  console.log("ProfileScreen render - profileData:", profileData);
  const hasLoadedProfile = useRef(false);
  const currentUserId = useRef<string | number | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const isRefreshing = useRef(false);
  const hasFocusedBefore = useRef(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      router.replace("/login");
    }
  }, [logout, router]);

  const refreshProfile = useCallback(
    async (force = false) => {
      if (!user || !user.id) return;

      if (isRefreshing.current) {
        console.log("Profile refresh already in progress, skipping");
        return;
      }

      const now = Date.now();
      if (!force && now - lastRefreshTime.current < 2000) {
        console.log("Profile refresh throttled (too recent)");
        return;
      }

      try {
        isRefreshing.current = true;
        lastRefreshTime.current = now;
        console.log("Refreshing profile data...");
        const result = await fetchProfile(force);
        console.log("Profile fetched successfully:", result);
      } catch (error) {
        console.error("Error refreshing profile:", error);
        if (error instanceof Error && error.message === "Authentication expired") {
          Alert.alert("Session Expired", "Please login again.", [
            { text: "OK", onPress: handleLogout },
          ]);
        }
      } finally {
        isRefreshing.current = false;
      }
    },
    [user, fetchProfile, handleLogout]
  );

  useFocusEffect(
    useCallback(() => {
      console.log("Profile screen focused");

      if (hasFocusedBefore.current) {
        console.log("Refreshing profile on return focus");
        refreshProfile(false);
      } else {
        console.log("Initial focus, skipping refresh");
        hasFocusedBefore.current = true;
      }
    }, [refreshProfile])
  );

  useEffect(() => {
    const loadProfile = async () => {
      console.log("useEffect loadProfile - user:", user);
      if (!user || !user.id) {
        console.log("No user or user.id, skipping profile load");
        return;
      }

      if (currentUserId.current !== user.id) {
        hasLoadedProfile.current = false;
        currentUserId.current = user.id;
      }

      if (hasLoadedProfile.current) {
        console.log("Profile already loaded, skipping");
        return;
      }

      hasLoadedProfile.current = true;
      console.log("Initial profile load");
      await refreshProfile(false);
    };

    loadProfile();
  }, [user, refreshProfile]);

  const renderProfileItem = (item: any, index: number) => {
    const handlePress = () => {
      if (item.label === "Edit Profile") {
        router.push("/(tabs)/profile/edit");
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
        onPress={item.action === "navigate" ? handlePress : undefined}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name={item.icon} size={24} color={colors.primary} />
          <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
            {item.label}
          </Text>
        </View>

        {item.action === "toggle" ? (
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, paddingTop: 15 }}>
        {/* User Info Section */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 40,
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#333",
          }}
        >
          {isLoadingProfile ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {console.log("ProfileData:", profileData)}
              {console.log("Avatar URL:", profileData?.avatar)}
              <View
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  backgroundColor: "#2A1A5E",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: "#4A3A8E",
                }}
              >
                {profileData?.avatar || user?.avatar ? (
                  <Image
                    source={{ uri: profileData?.avatar || user?.avatar }}
                    style={{ width: 150, height: 150 }}
                    resizeMode="cover"
                    onLoad={() => console.log("Avatar loaded successfully")}
                    onError={(error) => console.log("Avatar load error:", error)}
                  />
                ) : (
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      backgroundColor: "#2A1A5E",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {/* Gradient overlay simulation */}
                    <View
                      style={{
                        position: "absolute",
                        width: 150,
                        height: 150,
                        backgroundColor: "#4A3A8E",
                        opacity: 0.6,
                      }}
                    />
                    <Ionicons name="person" size={60} color="#fff" />
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {profileData?.name ||
                  profileData?.username ||
                  user?.name ||
                  "Music Lover"}
              </Text>
            </>
          )}
        </View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View style={{ marginTop: 24 }} key={sectionIndex}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#999",
                paddingHorizontal: 24,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {section.title}
            </Text>
            <View
              style={{
                backgroundColor: colors.backgroundCard,
                marginHorizontal: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {section.items.map((item, itemIndex) => renderProfileItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={{
            marginHorizontal: 16,
            marginTop: 32,
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#dc2626",
          }}
          onPress={handleLogout}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontWeight: "600" }}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={{ alignItems: "center", paddingBottom: 80 }}>
          <Text style={{ fontSize: 12, color: "#666" }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
